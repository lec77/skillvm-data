"""Tests for the sensor-weather data pipeline.

8 tests PASS, 2 tests FAIL due to the timezone mismatch bug in loaders.py.
"""

import os
import tempfile
from datetime import datetime, timezone

import pytest

from data_pipeline.loaders import load_sensor_data, load_weather_data
from data_pipeline.schema import MergedRecord, SensorReading, WeatherData
from data_pipeline.transformers import aggregate_hourly, filter_anomalies, merge_datasets
from data_pipeline.validators import validate_completeness, validate_ranges, validate_schema
from data_pipeline.pipeline import run_pipeline
from data_pipeline.utils import format_output

FIXTURES = os.path.join(os.path.dirname(__file__))
SENSOR_CSV = os.path.join(FIXTURES, "sensor_data.csv")
WEATHER_CSV = os.path.join(FIXTURES, "weather_data.csv")


# ---------------------------------------------------------------------------
# PASS: basic loading
# ---------------------------------------------------------------------------

def test_load_sensor_data():
    """Sensor loader should return 20 SensorReading objects with UTC tz."""
    data = load_sensor_data(SENSOR_CSV)
    assert len(data) == 20
    assert all(isinstance(r, SensorReading) for r in data)
    # Timestamps must be timezone-aware (UTC)
    assert all(r.timestamp.tzinfo is not None for r in data)


def test_load_weather_data():
    """Weather loader should return 20 WeatherData objects (naive tz — the bug)."""
    data = load_weather_data(WEATHER_CSV)
    assert len(data) == 20
    assert all(isinstance(r, WeatherData) for r in data)
    # The loader produces naive timestamps (this is the root cause of the bug,
    # but the loader itself works as coded — so the test passes).
    assert all(r.timestamp.tzinfo is None for r in data)


# ---------------------------------------------------------------------------
# PASS: validation helpers
# ---------------------------------------------------------------------------

def test_validate_schema():
    """Schema validator should accept well-formed records."""
    records = [
        SensorReading("S001", datetime(2025, 6, 1, 8, tzinfo=timezone.utc), 23.5, "ppm"),
    ]
    ok, msg = validate_schema(records, {"sensor_id", "timestamp", "value", "unit"})
    assert ok is True


def test_validate_ranges():
    """Range validator should catch out-of-range values."""
    records = [
        MergedRecord("S001", "W01", datetime(2025, 6, 1, 8, tzinfo=timezone.utc),
                      23.5, 15.0, 60.0),
    ]
    ok, _ = validate_ranges(records, {"value": (0, 100), "temperature": (-40, 50)})
    assert ok is True

    # Now test an out-of-range value
    bad = [
        MergedRecord("S001", "W01", datetime(2025, 6, 1, 8, tzinfo=timezone.utc),
                      200.0, 15.0, 60.0),
    ]
    ok, msg = validate_ranges(bad, {"value": (0, 100)})
    assert ok is False
    assert "outside" in msg


# ---------------------------------------------------------------------------
# PASS: transformers on well-formed data
# ---------------------------------------------------------------------------

def test_filter_anomalies():
    """Anomaly filter should keep normal records and remove outliers."""
    base_ts = datetime(2025, 6, 1, 8, tzinfo=timezone.utc)
    normal = [
        MergedRecord("S001", "W01", base_ts, v, 15.0, 60.0)
        for v in [23.0, 24.0, 22.5, 23.8, 24.2]
    ]
    outlier = MergedRecord("S001", "W01", base_ts, 999.0, 15.0, 60.0)
    result = filter_anomalies(normal + [outlier], threshold=2.0)
    assert len(result) == 5  # outlier removed
    assert all(r.value < 100 for r in result)


def test_aggregate_hourly():
    """Hourly aggregation on a small hand-crafted dataset."""
    ts1 = datetime(2025, 6, 1, 8, 0, tzinfo=timezone.utc)
    ts2 = datetime(2025, 6, 1, 8, 30, tzinfo=timezone.utc)
    ts3 = datetime(2025, 6, 1, 9, 0, tzinfo=timezone.utc)
    records = [
        MergedRecord("S001", "W01", ts1, 10.0, 15.0, 60.0),
        MergedRecord("S001", "W01", ts2, 20.0, 16.0, 58.0),
        MergedRecord("S002", "W01", ts3, 30.0, 17.0, 55.0),
    ]
    agg = aggregate_hourly(records)
    assert len(agg) == 2  # two distinct hours
    assert agg[0].record_count == 2
    assert agg[1].record_count == 1


# ---------------------------------------------------------------------------
# PASS: pipeline integration (it runs without crashing)
# ---------------------------------------------------------------------------

def test_pipeline_runs():
    """The pipeline should complete without errors (even if merge is empty)."""
    with tempfile.NamedTemporaryFile(suffix=".jsonl", delete=False) as tmp:
        out_path = tmp.name
    try:
        summary = run_pipeline(SENSOR_CSV, WEATHER_CSV, out_path)
        assert "sensor_records_loaded" in summary
        assert "weather_records_loaded" in summary
        assert summary["sensor_records_loaded"] == 20
        assert summary["weather_records_loaded"] == 20
    finally:
        if os.path.exists(out_path):
            os.unlink(out_path)


def test_export_format():
    """format_output should write one JSON line per record."""
    base_ts = datetime(2025, 6, 1, 8, tzinfo=timezone.utc)
    records = [
        MergedRecord("S001", "W01", base_ts, 23.5, 15.0, 60.0),
        MergedRecord("S002", "W01", base_ts, 31.2, 17.0, 58.0),
    ]
    with tempfile.NamedTemporaryFile(mode="r", suffix=".jsonl", delete=False) as tmp:
        out_path = tmp.name
    try:
        format_output(records, out_path)
        with open(out_path) as fh:
            lines = fh.readlines()
        assert len(lines) == 2
    finally:
        os.unlink(out_path)


# ---------------------------------------------------------------------------
# FAIL: these two tests expose the timezone bug
# ---------------------------------------------------------------------------

def test_merge_preserves_all_records():
    """Merge should keep all matchable records.

    Both CSVs have 20 rows with identical timestamps, so we expect 20
    merged records.  Due to the timezone mismatch bug (sensor = UTC-aware,
    weather = naive), the merge silently drops every record.
    """
    sensor_data = load_sensor_data(SENSOR_CSV)
    weather_data = load_weather_data(WEATHER_CSV)

    merged = merge_datasets(sensor_data, weather_data, tolerance_seconds=60)

    # Every sensor reading has a matching weather observation at the same
    # timestamp, so we expect all 20 to be merged.
    assert len(merged) == 20, (
        f"Expected 20 merged records, got {len(merged)}. "
        "Likely caused by timezone-aware vs naive timestamp mismatch."
    )


def test_timezone_handling():
    """Sensor and weather timestamps for the same instant should be equal.

    This test directly checks that the loaders produce comparable
    timestamps.  It fails because load_sensor_data returns UTC-aware
    datetimes while load_weather_data returns naive datetimes.
    """
    sensor_data = load_sensor_data(SENSOR_CSV)
    weather_data = load_weather_data(WEATHER_CSV)

    sensor_ts = sensor_data[0].timestamp
    weather_ts = weather_data[0].timestamp

    # Both files contain '2025-06-01T08:00:00' as the first timestamp.
    # They represent the same instant, so they should be equal.
    assert sensor_ts == weather_ts, (
        f"Timestamps should match but don't: "
        f"sensor={sensor_ts!r} (tzinfo={sensor_ts.tzinfo}), "
        f"weather={weather_ts!r} (tzinfo={weather_ts.tzinfo}). "
        "The weather loader is missing timezone info."
    )
