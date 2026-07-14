"""Tests for csv_cleaner.main.deduplicate."""
import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from main import deduplicate, normalize_row, clean_csv_string


def test_no_duplicates():
    rows = [["Alice", "30"], ["Bob", "25"], ["Carol", "35"]]
    result = deduplicate(rows)
    assert result == rows


def test_exact_duplicates():
    # Completely identical rows — both key=row[0] and tuple(row) agree
    rows = [["Alice", "30"], ["Alice", "30"], ["Bob", "25"]]
    result = deduplicate(rows)
    assert result == [["Alice", "30"], ["Bob", "25"]]


def test_same_first_col_different_second():
    # Two rows share first column but differ in second — NOT duplicates
    rows = [["Alice", "engineer"], ["Alice", "manager"]]
    result = deduplicate(rows)
    assert len(result) == 2  # BUG: key=row[0] returns only 1


def test_mixed_partial_duplicates():
    rows = [["X", "1"], ["X", "2"], ["Y", "3"]]
    result = deduplicate(rows)
    assert len(result) == 3  # BUG: key=row[0] returns 2 (X deduped)


def test_all_same_first_col():
    rows = [["A", "1"], ["A", "2"], ["A", "3"]]
    result = deduplicate(rows)
    assert len(result) == 3  # BUG: key=row[0] returns 1


def test_single_row():
    rows = [["Alice", "30"]]
    result = deduplicate(rows)
    assert result == [["Alice", "30"]]


def test_empty():
    result = deduplicate([])
    assert result == []
