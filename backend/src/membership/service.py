"""
Membership Service — subscribe/cancel/resume via the mock Visa provider,
payment methods, transaction ledger + receipts, avatar frames, and the
/membership/me + /membership/quotas aggregation.
"""
from datetime import datetime, timezone
from typing import Optional

from dateutil.relativedelta import relativedelta
from fastapi import Request
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import (
    ValidationException,
    ResourceNotFoundException,
    ConflictException,
    PaymentDeclinedException,
    FrameNotEligibleException,
)
from src.membership import mock_visa, quota
from src.membership.entitlements import (
    ENTITLEMENTS,
    get_entitlements,
    resolve_effective_tier,
    tier_rank,
    local_today,
    SAVOR_STREAK_DAYS,
    OMAKASE_STREAK_DAYS,
)
from src.membership.models import (
    Subscription, PaymentMethod, PaymentTransaction, AvatarFrame, UserFrame, StreakFreeze,
)
from src.membership.schemas import SubscribeRequest, SavePaymentMethodRequest
from src.users.models import User

PLAN_PRICING = {
    "feast_monthly": {"price_vnd": 49000, "interval": "month"},
    "feast_yearly": {"price_vnd": 490000, "interval": "year", "savings_pct": 17},
}

PLAN_DURATIONS = {
    "feast_monthly": relativedelta(months=1),
    "feast_yearly": relativedelta(years=1),
}

DECLINE_MESSAGES = {
    "card_declined": "Your card was declined.",
    "insufficient_funds": "Your card has insufficient funds.",
    "expired_card": "Your card has expired.",
    "incorrect_cvc": "Your card's security code is incorrect.",
    "processing_error": "An error occurred while processing your card. Please try again.",
}


def list_plans() -> list:
    return [{"plan": plan, "currency": "VND", **info} for plan, info in PLAN_PRICING.items()]


def list_entitlements() -> dict:
    return ENTITLEMENTS


# ─── Helpers ──────────────────────────────────────────────────────────────

async def _get_user_or_404(db: AsyncSession, user_id: int) -> User:
    user = await db.get(User, user_id)
    if not user:
        raise ResourceNotFoundException(detail="User not found", error_code="USER_NOT_FOUND")
    return user


async def _get_active_subscription_or_404(db: AsyncSession, user_id: int) -> Subscription:
    res = await db.execute(
        select(Subscription).where(Subscription.user_id == user_id, Subscription.status == "active")
    )
    sub = res.scalar_one_or_none()
    if not sub:
        raise ResourceNotFoundException(detail="No active subscription found", error_code="SUBSCRIPTION_NOT_FOUND")
    return sub


async def _get_or_create_payment_method(
    db: AsyncSession, user_id: int, cleaned_number: str, exp_month: int, exp_year: int,
    name: Optional[str], test_behavior: str,
) -> PaymentMethod:
    fp = mock_visa.fingerprint(cleaned_number)
    res = await db.execute(
        select(PaymentMethod).where(PaymentMethod.user_id == user_id, PaymentMethod.fingerprint == fp)
    )
    pm = res.scalar_one_or_none()
    if pm:
        pm.exp_month = exp_month
        pm.exp_year = exp_year
        pm.test_behavior = test_behavior
        if name:
            pm.cardholder_name = name
        return pm

    mask = mock_visa.mask(cleaned_number)
    count_res = await db.execute(
        select(func.count()).select_from(PaymentMethod).where(PaymentMethod.user_id == user_id)
    )
    is_default = (count_res.scalar_one() or 0) == 0

    pm = PaymentMethod(
        user_id=user_id,
        brand=mask["brand"],
        last4=mask["last4"],
        exp_month=exp_month,
        exp_year=exp_year,
        cardholder_name=name,
        fingerprint=fp,
        test_behavior=test_behavior,
        is_default=is_default,
    )
    db.add(pm)
    await db.flush()
    return pm


async def _clear_other_defaults(db: AsyncSession, user_id: int, keep_id: int) -> None:
    res = await db.execute(
        select(PaymentMethod).where(PaymentMethod.user_id == user_id, PaymentMethod.id != keep_id)
    )
    for pm in res.scalars().all():
        pm.is_default = False


async def _freezes_used_this_month(db: AsyncSession, user_id: int) -> int:
    first_of_month = local_today().replace(day=1)
    res = await db.execute(
        select(func.count()).select_from(StreakFreeze).where(
            StreakFreeze.user_id == user_id, StreakFreeze.frozen_date >= first_of_month
        )
    )
    return res.scalar_one() or 0


def _subscription_stub(sub: Optional[Subscription]) -> Optional[dict]:
    if sub is None:
        return None
    return {
        "plan": sub.plan,
        "status": sub.status,
        "current_period_start": sub.current_period_start,
        "current_period_end": sub.current_period_end,
        "cancel_at_period_end": sub.cancel_at_period_end,
    }


def _frame_stub(frame: Optional[AvatarFrame]) -> Optional[dict]:
    if frame is None:
        return None
    return {
        "id": frame.id,
        "slug": frame.slug,
        "style_key": frame.style_key,
        "accent_color": frame.accent_color,
        "is_animated": frame.is_animated,
    }


def _payment_method_stub(pm: PaymentMethod) -> dict:
    return {
        "id": pm.id, "brand": pm.brand, "last4": pm.last4,
        "exp_month": pm.exp_month, "exp_year": pm.exp_year, "is_default": pm.is_default,
    }


def _transaction_stub(txn: PaymentTransaction) -> dict:
    return {
        "id": txn.id, "type": txn.type, "status": txn.status,
        "amount_vnd": txn.amount_vnd, "currency": txn.currency,
        "decline_code": txn.decline_code, "receipt_number": txn.receipt_number,
        "provider_txn_id": txn.provider_txn_id, "created_at": txn.created_at,
    }


# ─── Status & Quotas ────────────────────────────────────────────────────────

async def get_membership_status(db: AsyncSession, user_id: int) -> dict:
    user = await _get_user_or_404(db, user_id)
    ctx = await resolve_effective_tier(db, user)
    await db.commit()
    await db.refresh(user)

    tier = ctx["tier"]
    streak = ctx["streak"]
    subscription = ctx["subscription"]
    current_streak = streak.current_streak if streak and ctx["streak_alive"] else 0

    days_to_savor = max(0, SAVOR_STREAK_DAYS - current_streak)
    days_to_omakase = max(0, OMAKASE_STREAK_DAYS - current_streak) if subscription else None

    equipped_frame = None
    if user.equipped_frame_id:
        equipped_frame = _frame_stub(await db.get(AvatarFrame, user.equipped_frame_id))

    owned_res = await db.execute(select(UserFrame.frame_id).where(UserFrame.user_id == user_id))
    frames_owned = [row[0] for row in owned_res.all()]

    freezes_used = await _freezes_used_this_month(db, user_id)
    allowance = get_entitlements(tier)["streak_freezes_per_month"]

    return {
        "tier": tier,
        "streak": {
            "current_streak": current_streak,
            "is_alive": ctx["streak_alive"],
            "days_to_savor": days_to_savor,
            "days_to_omakase": days_to_omakase,
        },
        "subscription": _subscription_stub(subscription),
        "equipped_frame": equipped_frame,
        "frames_owned": frames_owned,
        "freezes": {"allowance": allowance, "used_this_month": freezes_used},
    }


async def get_quotas(db: AsyncSession, request: Request, user_id: int) -> dict:
    user = await _get_user_or_404(db, user_id)
    output = {}
    for feature in quota.FEATURE_LIMIT_KEYS:
        usage = await quota.get_usage(request, user, feature)
        if usage is not None:
            output[feature] = usage
    return output


# ─── Subscribe / Cancel / Resume ────────────────────────────────────────────

async def subscribe(db: AsyncSession, user_id: int, body: SubscribeRequest) -> dict:
    user = await _get_user_or_404(db, user_id)

    if body.plan not in PLAN_PRICING:
        raise ValidationException(detail="Unknown plan", error_code="VALIDATION_ERROR")

    # Idempotency replay — never charge twice for the same key.
    existing_res = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.idempotency_key == body.idempotency_key)
    )
    existing_txn = existing_res.scalar_one_or_none()
    if existing_txn is not None:
        if existing_txn.status == "succeeded":
            sub = await db.get(Subscription, existing_txn.subscription_id) if existing_txn.subscription_id else None
            return {
                "subscription": _subscription_stub(sub),
                "transaction": _transaction_stub(existing_txn),
                "tier": user.membership_tier,
            }
        raise PaymentDeclinedException(
            detail=DECLINE_MESSAGES.get(existing_txn.decline_code, "Your card was declined."),
            decline_code=existing_txn.decline_code,
        )

    price_vnd = PLAN_PRICING[body.plan]["price_vnd"]

    if body.card is not None:
        cleaned = mock_visa.validate_card(
            body.card.number, body.card.exp_month, body.card.exp_year, body.card.cvc
        )
        test_behavior = mock_visa.detect_test_behavior(cleaned)
        payment_method = await _get_or_create_payment_method(
            db, user_id, cleaned, body.card.exp_month, body.card.exp_year, body.card.name, test_behavior
        )
        outcome = await mock_visa.charge(cleaned)
    elif body.payment_method_id is not None:
        payment_method = await db.get(PaymentMethod, body.payment_method_id)
        if not payment_method or payment_method.user_id != user_id:
            raise ResourceNotFoundException(detail="Payment method not found", error_code="PAYMENT_METHOD_NOT_FOUND")
        outcome = await mock_visa.charge_saved(payment_method.test_behavior)
    else:
        raise ValidationException(detail="Provide either 'card' or 'payment_method_id'.", error_code="VALIDATION_ERROR")

    transaction = PaymentTransaction(
        user_id=user_id,
        payment_method_id=payment_method.id,
        amount_vnd=price_vnd,
        currency="VND",
        type="purchase",
        status=outcome["status"],
        provider="mockvisa",
        provider_txn_id=outcome["provider_txn_id"],
        decline_code=outcome["decline_code"],
        idempotency_key=body.idempotency_key,
        description=f"TasteMap {body.plan}",
    )
    db.add(transaction)
    await db.flush()

    if outcome["status"] != "succeeded":
        await db.commit()
        raise PaymentDeclinedException(
            detail=DECLINE_MESSAGES.get(outcome["decline_code"], "Your card was declined."),
            decline_code=outcome["decline_code"],
        )

    now = datetime.now(timezone.utc)
    period_end = now + PLAN_DURATIONS[body.plan]

    existing_sub_res = await db.execute(
        select(Subscription).where(Subscription.user_id == user_id, Subscription.status == "active")
    )
    subscription = existing_sub_res.scalar_one_or_none()
    if subscription is None:
        subscription = Subscription(
            user_id=user_id,
            plan=body.plan,
            status="active",
            price_vnd=price_vnd,
            currency="VND",
            current_period_start=now,
            current_period_end=period_end,
            payment_method_id=payment_method.id,
        )
        db.add(subscription)
    else:
        subscription.plan = body.plan
        subscription.price_vnd = price_vnd
        subscription.current_period_start = now
        subscription.current_period_end = period_end
        subscription.cancel_at_period_end = False
        subscription.canceled_at = None
        subscription.payment_method_id = payment_method.id
    await db.flush()

    transaction.subscription_id = subscription.id
    transaction.receipt_number = f"TM-{now.year}-{transaction.id:06d}"

    await resolve_effective_tier(db, user)
    await db.commit()
    await db.refresh(subscription)
    await db.refresh(transaction)
    await db.refresh(user)

    return {
        "subscription": _subscription_stub(subscription),
        "transaction": _transaction_stub(transaction),
        "tier": user.membership_tier,
    }


async def cancel_subscription(db: AsyncSession, user_id: int) -> dict:
    sub = await _get_active_subscription_or_404(db, user_id)
    sub.cancel_at_period_end = True
    sub.canceled_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(sub)
    return {
        "status": sub.status,
        "cancel_at_period_end": sub.cancel_at_period_end,
        "current_period_end": sub.current_period_end,
    }


async def resume_subscription(db: AsyncSession, user_id: int) -> dict:
    sub = await _get_active_subscription_or_404(db, user_id)
    sub.cancel_at_period_end = False
    sub.canceled_at = None
    await db.commit()
    await db.refresh(sub)
    return {"status": sub.status, "cancel_at_period_end": sub.cancel_at_period_end}


# ─── Payment Methods ─────────────────────────────────────────────────────

async def list_payment_methods(db: AsyncSession, user_id: int) -> list:
    res = await db.execute(
        select(PaymentMethod).where(PaymentMethod.user_id == user_id).order_by(PaymentMethod.created_at.desc())
    )
    return [_payment_method_stub(pm) for pm in res.scalars().all()]


async def add_payment_method(db: AsyncSession, user_id: int, body: SavePaymentMethodRequest) -> dict:
    cleaned = mock_visa.validate_card(body.number, body.exp_month, body.exp_year, body.cvc)
    test_behavior = mock_visa.detect_test_behavior(cleaned)
    pm = await _get_or_create_payment_method(db, user_id, cleaned, body.exp_month, body.exp_year, body.name, test_behavior)
    if body.set_default:
        await _clear_other_defaults(db, user_id, pm.id)
        pm.is_default = True
    await db.commit()
    await db.refresh(pm)
    return _payment_method_stub(pm)


async def delete_payment_method(db: AsyncSession, user_id: int, payment_method_id: int) -> None:
    pm = await db.get(PaymentMethod, payment_method_id)
    if not pm or pm.user_id != user_id:
        raise ResourceNotFoundException(detail="Payment method not found", error_code="PAYMENT_METHOD_NOT_FOUND")

    active_sub_res = await db.execute(
        select(Subscription).where(Subscription.payment_method_id == payment_method_id, Subscription.status == "active")
    )
    if active_sub_res.scalar_one_or_none():
        raise ConflictException(
            detail="Cannot delete a payment method attached to an active subscription.",
            error_code="PAYMENT_METHOD_IN_USE",
        )

    await db.delete(pm)
    await db.commit()


# ─── Transactions & Receipts ─────────────────────────────────────────────

async def list_transactions(db: AsyncSession, user_id: int, limit: int, offset: int) -> dict:
    base_q = select(PaymentTransaction).where(PaymentTransaction.user_id == user_id)
    count_res = await db.execute(select(func.count()).select_from(base_q.subquery()))
    total = count_res.scalar_one() or 0

    q = base_q.order_by(PaymentTransaction.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(q)
    items = [_transaction_stub(t) for t in result.scalars().all()]
    return {"items": items, "total": total, "limit": limit, "offset": offset}


async def get_receipt(db: AsyncSession, user_id: int, transaction_id: int) -> dict:
    txn = await db.get(PaymentTransaction, transaction_id)
    if not txn or txn.user_id != user_id or txn.status != "succeeded":
        raise ResourceNotFoundException(detail="Receipt not found", error_code="RECEIPT_NOT_FOUND")

    pm = await db.get(PaymentMethod, txn.payment_method_id) if txn.payment_method_id else None
    sub = await db.get(Subscription, txn.subscription_id) if txn.subscription_id else None

    return {
        "receipt_number": txn.receipt_number,
        "plan": sub.plan if sub else None,
        "amount_vnd": txn.amount_vnd,
        "currency": txn.currency,
        "card_last4": pm.last4 if pm else None,
        "period_start": sub.current_period_start if sub else None,
        "period_end": sub.current_period_end if sub else None,
        "created_at": txn.created_at,
    }


# ─── Avatar Frames ───────────────────────────────────────────────────────

async def list_frames(db: AsyncSession, user_id: int) -> list:
    user = await _get_user_or_404(db, user_id)
    frames_res = await db.execute(
        select(AvatarFrame).where(AvatarFrame.is_active == True).order_by(AvatarFrame.sort_order)  # noqa: E712
    )
    frames = frames_res.scalars().all()

    owned_res = await db.execute(select(UserFrame.frame_id).where(UserFrame.user_id == user_id))
    owned_ids = {row[0] for row in owned_res.all()}

    tier = user.membership_tier or "bite"
    rank = tier_rank(tier)

    output = []
    for f in frames:
        owned = f.id in owned_ids
        output.append({
            "id": f.id,
            "slug": f.slug,
            "name": f.name,
            "min_tier": f.min_tier,
            "style_key": f.style_key,
            "accent_color": f.accent_color,
            "is_animated": f.is_animated,
            "owned": owned,
            "equippable": owned and tier_rank(f.min_tier) <= rank,
        })
    return output


async def equip_frame(db: AsyncSession, user_id: int, frame_id: Optional[int]) -> dict:
    user = await _get_user_or_404(db, user_id)

    if frame_id is None:
        user.equipped_frame_id = None
        await db.commit()
        return {"equipped_frame_id": None}

    owned_res = await db.execute(
        select(UserFrame).where(UserFrame.user_id == user_id, UserFrame.frame_id == frame_id)
    )
    if not owned_res.scalar_one_or_none():
        raise FrameNotEligibleException(detail="You do not own this frame.")

    frame = await db.get(AvatarFrame, frame_id)
    if not frame:
        raise ResourceNotFoundException(detail="Frame not found", error_code="FRAME_NOT_FOUND")

    tier = user.membership_tier or "bite"
    if tier_rank(frame.min_tier) > tier_rank(tier):
        raise FrameNotEligibleException(detail=f"This frame requires {frame.min_tier} tier or higher.")

    user.equipped_frame_id = frame_id
    await db.commit()
    return {"equipped_frame_id": frame_id}
