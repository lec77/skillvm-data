"""Tests for log_filter.main.filter_by_date."""
import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from main import filter_by_date

ENTRIES = [
    {"date": "2024-01-01", "msg": "start"},
    {"date": "2024-01-15", "msg": "mid"},
    {"date": "2024-01-31", "msg": "end"},
    {"date": "2024-02-01", "msg": "after"},
]


def test_empty_entries():
    assert filter_by_date([], "2024-01-01", "2024-01-31") == []


def test_start_inclusive():
    result = filter_by_date(ENTRIES, "2024-01-01", "2024-01-31")
    assert any(e["msg"] == "start" for e in result)


def test_end_inclusive():
    # Entry on the exact end date must be included
    result = filter_by_date(ENTRIES, "2024-01-01", "2024-01-31")
    dates = [e["date"] for e in result]
    assert "2024-01-31" in dates  # BUG: < end excludes this


def test_after_range_excluded():
    result = filter_by_date(ENTRIES, "2024-01-01", "2024-01-31")
    dates = [e["date"] for e in result]
    assert "2024-02-01" not in dates


def test_only_end_date():
    result = filter_by_date(ENTRIES, "2024-01-31", "2024-01-31")
    assert len(result) == 1  # BUG: < end returns 0
    assert result[0]["msg"] == "end"


def test_no_entries_in_range():
    result = filter_by_date(ENTRIES, "2024-03-01", "2024-03-31")
    assert result == []


def test_full_range_count():
    result = filter_by_date(ENTRIES, "2024-01-01", "2024-01-31")
    assert len(result) == 3  # BUG: returns 2 (excludes end date)
