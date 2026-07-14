"""Tests for data_merger.main.merge_records."""
import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from main import merge_records


def test_empty_updates():
    base = [{"id": 1, "v": "a"}]
    result = merge_records(base, [])
    assert result == base


def test_single_update_new():
    # Single item in updates — it is the last (and only) item, so BUG drops it
    base = [{"id": 1, "v": "a"}]
    result = merge_records(base, [{"id": 2, "v": "b"}])
    ids = [r["id"] for r in result]
    assert 2 in ids  # BUG: updates[:-1] = [] so id=2 never added


def test_last_item_of_multiple_is_new():
    base = [{"id": 1, "v": "a"}]
    updates = [{"id": 2, "v": "b"}, {"id": 3, "v": "c"}]
    result = merge_records(base, updates)
    ids = [r["id"] for r in result]
    assert 3 in ids  # BUG: last item (id=3) is dropped


def test_last_item_update():
    # Last item in updates should update an existing record
    base = [{"id": 1, "v": "old"}, {"id": 2, "v": "old"}]
    updates = [{"id": 1, "v": "new1"}, {"id": 2, "v": "new2"}]
    result = merge_records(base, updates)
    r2 = next(r for r in result if r["id"] == 2)
    assert r2["v"] == "new2"  # BUG: last update (id=2) is dropped, stays "old"


def test_first_item_processed():
    base = [{"id": 1, "v": "a"}]
    updates = [{"id": 2, "v": "b"}, {"id": 3, "v": "c"}]
    result = merge_records(base, updates)
    ids = [r["id"] for r in result]
    assert 2 in ids  # first item is correctly added


def test_no_mutation_of_base():
    base = [{"id": 1, "v": "a"}]
    updates = [{"id": 2, "v": "b"}, {"id": 3, "v": "c"}]
    original_base = list(base)
    merge_records(base, updates)
    assert base == original_base


def test_empty_base():
    updates = [{"id": 1, "v": "a"}, {"id": 2, "v": "b"}]
    result = merge_records([], updates)
    ids = [r["id"] for r in result]
    assert 1 in ids  # first item OK
    assert 2 in ids  # BUG: last item missing
