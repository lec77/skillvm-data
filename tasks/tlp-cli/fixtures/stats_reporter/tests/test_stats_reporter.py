"""Tests for stats_reporter.main.detect_outliers."""
import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from main import detect_outliers, summary_stats


def test_upper_fence_value():
    # [1..10, 16]: q1=s[2]=3, q3=s[7]=8 (n=11), iqr=5
    # 1.5x: upper = 8 + 7.5 = 15.5. BUG 1.0x: upper = 8 + 5 = 13
    result = detect_outliers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    # With 1.5x iqr (correct), all values are within fences
    assert result["count"] == 0


def test_boundary_not_outlier():
    # Value at q3 + 1.4*iqr: NOT an outlier under correct 1.5x rule
    # but IS an outlier under buggy 1.0x rule.
    # [1,2,3,4,5,6,7,8,9,10,16]: q1=3, q3=9 (n=11), iqr=6
    # 1.5x: upper = 9 + 9 = 18 → 16 < 18, not outlier
    # 1.0x: upper = 9 + 6 = 15 → 16 > 15, outlier
    result = detect_outliers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 16])
    assert result["count"] == 0  # BUG: returns count=1


def test_lower_boundary_not_outlier():
    # [-4, 1..10]: q1=2, q3=8 (n=11), iqr=6
    # 1.5x: lower = 2 - 9 = -7 → -4 > -7, not outlier
    # 1.0x: lower = 2 - 6 = -4 → -4 is exactly on the fence; Python: -4 < -4 is False
    # Let's use -5 to be unambiguous:
    # [-5, 1..10]: q1=2, q3=8, iqr=6 → 1.5x lower=-7 (not outlier), 1.0x lower=-4 (-5<-4, outlier)
    result = detect_outliers([-5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    assert result["count"] == 0  # BUG: returns count=1 (1.0x lower=-4, -5 < -4)


def test_extreme_outlier_detected():
    # Very extreme value — both 1.0x and 1.5x methods flag it
    result = detect_outliers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1000])
    assert result["count"] == 1
    assert 1000 in result["outliers"]


def test_empty():
    result = detect_outliers([])
    assert result["count"] == 0
    assert result["outliers"] == []


def test_uniform_data():
    result = detect_outliers([5.0] * 10)
    assert result["count"] == 0


def test_summary_stats_mean():
    result = summary_stats([1.0, 2.0, 3.0, 4.0, 5.0])
    assert result["mean"] == pytest.approx(3.0)
    assert result["count"] == 5
