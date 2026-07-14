"""Tests for report_generator.generator."""
import sys
import os
import pytest
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from generator import format_date, summarize_metrics, compute_percentile, build_report


def test_format_date_basic():
    dt = datetime(2024, 3, 15)
    assert format_date(dt) == "2024-03-15"


def test_format_date_single_digit():
    dt = datetime(2024, 1, 5)
    assert format_date(dt) == "2024-01-05"


def test_format_date_year():
    dt = datetime(2000, 12, 31)
    assert format_date(dt) == "2000-12-31"


def test_summarize_metrics_basic():
    result = summarize_metrics({"a": 10.0, "b": 20.0, "c": 30.0})
    assert result["count"] == 3
    assert result["min"] == pytest.approx(10.0)
    assert result["max"] == pytest.approx(30.0)
    assert result["mean"] == pytest.approx(20.0)
    assert result["range"] == pytest.approx(20.0)


def test_summarize_metrics_empty():
    result = summarize_metrics({})
    assert result["count"] == 0
    assert result["min"] is None


def test_summarize_metrics_single():
    result = summarize_metrics({"x": 5.0})
    assert result["min"] == result["max"] == result["mean"] == pytest.approx(5.0)
    assert result["range"] == pytest.approx(0.0)


def test_percentile_median():
    vals = [1.0, 2.0, 3.0, 4.0, 5.0]
    assert compute_percentile(vals, 0.5) == pytest.approx(3.0)


def test_percentile_min():
    vals = [10.0, 20.0, 30.0]
    assert compute_percentile(vals, 0.0) == pytest.approx(10.0)


def test_percentile_max():
    vals = [10.0, 20.0, 30.0]
    assert compute_percentile(vals, 1.0) == pytest.approx(30.0)


def test_percentile_p25():
    vals = [0.0, 1.0, 2.0, 3.0]
    # int(0.25 * (4-1)) = int(0.75) = 0 => sorted[0] = 0.0
    assert compute_percentile(vals, 0.25) == pytest.approx(0.0)


def test_percentile_empty():
    with pytest.raises(ValueError):
        compute_percentile([], 0.5)


def test_percentile_invalid_p():
    with pytest.raises(ValueError):
        compute_percentile([1.0], 1.5)


def test_build_report_structure():
    dt = datetime(2024, 6, 1)
    report = build_report("Test Report", dt, {"latency": 42.0, "errors": 3.0})
    assert report["title"] == "Test Report"
    assert report["generated_at"] == "2024-06-01"
    assert "summary" in report
    assert report["metrics"]["latency"] == pytest.approx(42.0)
