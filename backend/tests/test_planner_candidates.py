"""Unit tests for the AI Planner's pure candidate-selection core (no DB).

Run:  cd backend && python -m pytest tests/test_planner_candidates.py -v
"""
from types import SimpleNamespace

import numpy as np
import pytest

import src.db.database  # noqa: F401 — registers models so src.planner.service imports cleanly
from src.planner import service


def _loc(loc_id, vec, *, name="Place", price="50k", characteristics=None):
    return SimpleNamespace(id=loc_id, name=name, vector=vec, price_range=price, characteristics=characteristics)


def _e(i):
    v = [0.0] * 15
    v[i] = 1.0
    return v


def test_mood_boost_changes_ranking():
    """A romantic-leaning venue should outrank a street-food venue once mood='romantic'."""
    fine_dining = _loc(1, _e(11), name="Le Table")   # index 11 = FineDining
    street_food = _loc(2, _e(10), name="Xe Day")      # index 10 = StreetFood
    neutral_user = np.full(15, 0.3, dtype=float)

    scored_neutral = service.select_candidates(
        [fine_dining, street_food], neutral_user, mood=None, cuisines=[], budget_vnd_max=None,
    )
    scored_romantic = service.select_candidates(
        [fine_dining, street_food], neutral_user, mood="romantic", cuisines=[], budget_vnd_max=None,
    )

    assert scored_romantic[0][0].id == 1, "romantic mood should rank the fine-dining venue first"
    # Sanity: without a mood boost the two near-identical vectors don't have a strong bias either way.
    assert {loc.id for loc, _ in scored_neutral} == {1, 2}


def test_budget_filter_excludes_expensive_venues():
    cheap = _loc(1, _e(0), price="30k")
    expensive = _loc(2, _e(0), price="500k")
    user = np.array(_e(0), dtype=float)

    scored = service.select_candidates(
        [cheap, expensive], user, mood=None, cuisines=[], budget_vnd_max=100_000,
    )

    assert [loc.id for loc, _ in scored] == [1]


def test_cuisine_hint_boosts_matching_locations():
    vn = _loc(1, _e(0), name="Phở Bò 36")
    other = _loc(2, _e(0), name="Random Diner")
    user = np.array(_e(0), dtype=float)

    scored = service.select_candidates(
        [other, vn], user, mood=None, cuisines=["vietnamese"], budget_vnd_max=None,
    )

    assert scored[0][0].id == 1, "cuisine-matching venue should be boosted to the top"
