"""Unit tests for the vector-aware tour optimiser (pure ordering core, no DB).

Run:  cd backend && python -m pytest tests/test_tour_optimizer.py -v
"""
from types import SimpleNamespace

import numpy as np
import pytest

import src.db.database  # noqa: F401 — registers models so src.tours.service imports cleanly
from src.tours import service


def _loc(loc_id, lat, lng, vec, *, rating=4.5, price="50k",
         open_hours="Open until 10PM", category="food", characteristics=None):
    return SimpleNamespace(
        id=loc_id, lat=lat, lng=lng, vector=vec, rating=rating,
        price_range=price, open_hours=open_hours, category=category,
        characteristics=characteristics,
    )


def _rows(*locs):
    """Wrap locations as (stop, location) tuples like the DB join returns."""
    return [(SimpleNamespace(location_id=l.id), l) for l in locs]


def _e(i):
    """Unit basis vector in R^15 (taste concentrated on one dimension)."""
    v = [0.0] * 15
    v[i] = 1.0
    return v


def test_personalisation_changes_route():
    """Same geography, opposite tastes → the first stop flips with the user vector."""
    # Two venues equidistant from start (0,0) but with opposite feature vectors.
    a = _loc(1, 0.0, 0.02, _e(0))   # matches taste A
    b = _loc(2, 0.0, -0.02, _e(1))  # matches taste B
    rows = _rows(a, b)

    user_a = np.array(_e(0), dtype=float)
    user_b = np.array(_e(1), dtype=float)
    kw = dict(c_weather=0.8, mode="driving", time_context=None)

    order_a, _, _ = service._optimize_order(rows, user_a, 0.0, 0.0, **kw)
    order_b, _, _ = service._optimize_order(rows, user_b, 0.0, 0.0, **kw)

    first_a = order_a[0][1].id
    first_b = order_b[0][1].id

    assert first_a == 1, "taste-A user should visit venue 1 first"
    assert first_b == 2, "taste-B user should visit venue 2 first"
    assert first_a != first_b, "the route must respond to the user's taste vector"


def test_match_score_and_dwell_present():
    a = _loc(1, 0.0, 0.01, _e(3), category="food")
    b = _loc(2, 0.0, 0.02, _e(3), category="place")
    rows = _rows(a, b)
    user = np.array(_e(3), dtype=float)

    order, sim01, dwell = service._optimize_order(
        rows, user, 0.0, 0.0, c_weather=0.8, mode="driving", time_context=None,
    )

    # A perfectly-aligned venue should score high (>50 after [-1,1]→[0,1] remap).
    assert sim01[1] > 0.9
    # Dwell differs by category (food longer than a place to visit).
    assert dwell[1] == service._DWELL_BY_CATEGORY["food"]
    assert dwell[2] == service._DWELL_BY_CATEGORY["place"]
    assert {r[1].id for r in order} == {1, 2}


def test_estimated_cost_parsing_sums_real_values():
    assert service._parse_price_vnd("35k") == 35_000
    assert service._parse_price_vnd("1.2M") == 1_200_000
    assert service._parse_price_vnd("150000") == 150_000
    assert service._parse_price_vnd("$$$") == 250_000
    assert service._parse_price_vnd(None) == 0
    total = sum(service._parse_price_vnd(p) for p in ["35k", "65k", "$$"])
    assert total == 35_000 + 65_000 + 120_000


def test_open_fit_time_context():
    assert service._open_fit("Open until 2AM", "late_night") == 1.0
    assert service._open_fit("Open until 6PM", "late_night") == 0.3
    assert service._open_fit("Open until 6PM", None) == 0.5  # no context → neutral


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
