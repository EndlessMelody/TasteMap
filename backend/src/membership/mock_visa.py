"""
Mock Visa Payment Provider — behaves like a real card processor for demo
purposes (Luhn validation, Stripe-style test cards, simulated processing
delay, deterministic declines). NEVER a real payment integration — the
`test_behavior` captured here is mock-only scaffolding (see
docs/database_schema/monetization.md) and must not survive a swap to a
real provider (Stripe, VNPay, etc.).

Test cards — see docs/api/monetization.md for the authoritative table.
"""
import asyncio
import hashlib
import random
import re
import uuid
from datetime import date
from typing import Optional

from src.core.exceptions import ValidationException

# Stripe-style test cards (digits only) -> deterministic (status, decline_code)
TEST_CARD_OUTCOMES: dict[str, tuple[str, Optional[str]]] = {
    "4242424242424242": ("succeeded", None),
    "4000000000000002": ("declined", "card_declined"),
    "4000000000009995": ("declined", "insufficient_funds"),
    "4000000000000069": ("declined", "expired_card"),
    "4000000000000127": ("declined", "incorrect_cvc"),
    "4000000000000119": ("declined", "processing_error"),
}

_PROCESSING_DELAY_RANGE = (0.2, 0.4)


def luhn_check(number: str) -> bool:
    digits = [int(d) for d in number]
    parity = len(digits) % 2
    checksum = 0
    for i, d in enumerate(digits):
        if i % 2 == parity:
            d *= 2
            if d > 9:
                d -= 9
        checksum += d
    return checksum % 10 == 0


def validate_card(number: str, exp_month: int, exp_year: int, cvc: str) -> str:
    """
    Fail-fast validation (Luhn, brand, expiry, CVV) BEFORE any simulated network
    delay or ledger write. Returns the cleaned (digits-only) card number.
    Raises ValidationException (400 VALIDATION_ERROR) on any failure.
    """
    cleaned = re.sub(r"\s+", "", number or "")

    if not cleaned.isdigit() or len(cleaned) not in (13, 16, 19):
        raise ValidationException(detail="Invalid card number.", error_code="VALIDATION_ERROR")

    if not cleaned.startswith("4"):
        raise ValidationException(detail="Only Visa cards are supported in this demo.", error_code="VALIDATION_ERROR")

    if not luhn_check(cleaned):
        raise ValidationException(detail="Invalid card number.", error_code="VALIDATION_ERROR")

    if not (1 <= exp_month <= 12):
        raise ValidationException(detail="Invalid expiry month.", error_code="VALIDATION_ERROR")

    today = date.today()
    if exp_year < today.year or (exp_year == today.year and exp_month < today.month):
        raise ValidationException(detail="Card has expired.", error_code="VALIDATION_ERROR")

    if not re.fullmatch(r"\d{3,4}", cvc or ""):
        raise ValidationException(detail="Invalid CVV.", error_code="VALIDATION_ERROR")

    return cleaned


def fingerprint(card_number: str) -> str:
    """SHA-256 of the PAN — used only for de-duplication, never reversible, PAN never stored."""
    return hashlib.sha256(card_number.encode()).hexdigest()


def mask(card_number: str) -> dict:
    return {"brand": "visa", "last4": card_number[-4:]}


def detect_test_behavior(card_number: str) -> str:
    """The behavior to persist on a saved payment_method for future renewal charges."""
    status, decline_code = TEST_CARD_OUTCOMES.get(card_number, ("succeeded", None))
    return decline_code if status == "declined" else "success"


async def charge(card_number: str) -> dict:
    """Simulate a real processing delay, then return a deterministic or default-success outcome."""
    await asyncio.sleep(random.uniform(*_PROCESSING_DELAY_RANGE))
    status, decline_code = TEST_CARD_OUTCOMES.get(card_number, ("succeeded", None))
    return {
        "status": status,
        "decline_code": decline_code,
        "provider_txn_id": f"mv_{uuid.uuid4().hex[:24]}",
    }


async def charge_saved(test_behavior: str) -> dict:
    """Charge a previously-saved payment method (renewals) using its stored test_behavior."""
    await asyncio.sleep(random.uniform(*_PROCESSING_DELAY_RANGE))
    if test_behavior == "success":
        return {"status": "succeeded", "decline_code": None, "provider_txn_id": f"mv_{uuid.uuid4().hex[:24]}"}
    return {"status": "declined", "decline_code": test_behavior, "provider_txn_id": f"mv_{uuid.uuid4().hex[:24]}"}
