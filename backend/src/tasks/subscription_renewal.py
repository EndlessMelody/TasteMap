"""
Subscription Renewal Cronjob
Chạy lúc 3:30 AM mỗi ngày (sau interaction_cleanup lúc 3:00 AM):
1. Tìm mọi subscription 'active' có current_period_end <= now.
2. Nếu cancel_at_period_end=True -> expire.
3. Ngược lại -> charge_saved(payment_method) qua mock Visa:
   - success -> gia hạn thêm 1 chu kỳ (+1 tháng / +365 ngày), ghi payment_transactions
     (renewal, succeeded) + receipt_number.
   - declined -> ghi payment_transactions (renewal, declined), expire subscription,
     tạo Notification báo user.

Giữa các lần chạy cron, resolve_effective_tier()'s lazy-expiry check
(src/membership/entitlements.py) vẫn đảm bảo tier luôn đúng ngay cả khi
cronjob chưa kịp chạy — xem docs/flows/monetization.md.

Cách tích hợp: Gọi schedule_subscription_renewal(app) trong lifespan của FastAPI.
"""
import logging
from datetime import datetime, timezone

from sqlalchemy.future import select

from src.db.database import AsyncSessionLocal
from src.membership import mock_visa
from src.membership.models import Subscription, PaymentMethod, PaymentTransaction
from src.membership.service import PLAN_DURATIONS
from src.notifications.models import Notification

logger = logging.getLogger(__name__)


async def _sweep_due_subscriptions():
    from src.db.redis import RedisClient

    try:
        client = RedisClient.get_client()
        acquired = await client.set("lock:subscription_renewal", "1", nx=True, ex=3600)
    except Exception:
        acquired = True  # Redis not ready yet — fail open rather than skip the job.

    if not acquired:
        logger.info("subscription_renewal: lock held by another worker, skipping.")
        return

    now = datetime.now(timezone.utc)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Subscription).where(
                Subscription.status == "active",
                Subscription.current_period_end <= now,
            )
        )
        due_subscriptions = result.scalars().all()

        if not due_subscriptions:
            logger.info("Không có subscription nào đến hạn gia hạn.")
            return

        for sub in due_subscriptions:
            try:
                await _process_due_subscription(session, sub, now)
            except Exception as e:
                logger.error(f"Lỗi xử lý gia hạn subscription {sub.id}: {e}")
                continue

        await session.commit()
        logger.info(f"Đã xử lý {len(due_subscriptions)} subscription đến hạn.")


async def _process_due_subscription(session, sub: Subscription, now: datetime) -> None:
    if sub.cancel_at_period_end:
        sub.status = "expired"
        return

    payment_method = await session.get(PaymentMethod, sub.payment_method_id) if sub.payment_method_id else None
    if payment_method is None:
        sub.status = "expired"
        return

    outcome = await mock_visa.charge_saved(payment_method.test_behavior)

    transaction = PaymentTransaction(
        user_id=sub.user_id,
        subscription_id=sub.id,
        payment_method_id=payment_method.id,
        amount_vnd=sub.price_vnd,
        currency=sub.currency,
        type="renewal",
        status=outcome["status"],
        provider="mockvisa",
        provider_txn_id=outcome["provider_txn_id"],
        decline_code=outcome["decline_code"],
        description=f"TasteMap {sub.plan} renewal",
    )
    session.add(transaction)
    await session.flush()

    if outcome["status"] == "succeeded":
        sub.current_period_start = now
        sub.current_period_end = now + PLAN_DURATIONS[sub.plan]
        transaction.receipt_number = f"TM-{now.year}-{transaction.id:06d}"
    else:
        sub.status = "expired"
        session.add(Notification(
            user_id=sub.user_id,
            type="system",
            title="Renewal failed",
            body=f"We couldn't renew your TasteMap {sub.plan} plan — your card was declined.",
            reference_type="subscription",
            reference_id=sub.id,
        ))


def schedule_subscription_renewal(app):
    """
    Tích hợp vào FastAPI lifespan, chạy lúc 3:30 AM hàng ngày.
    Usage trong main.py lifespan:
        from src.tasks.subscription_renewal import schedule_subscription_renewal
        schedule_subscription_renewal(app)
    """
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        scheduler = AsyncIOScheduler()
        scheduler.add_job(
            _sweep_due_subscriptions,
            "cron",
            hour=3,
            minute=30,
            id="subscription_renewal",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("APScheduler: Subscription renewal cronjob đã lên lịch 3:30 AM hàng ngày.")
    except ImportError:
        logger.warning(
            "APScheduler chưa cài — cronjob gia hạn subscription không hoạt động. "
            "Chạy: pip install apscheduler"
        )
