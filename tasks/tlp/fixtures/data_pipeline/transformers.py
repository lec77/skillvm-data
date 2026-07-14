"""Data transformation functions: merge, aggregate, filter."""

from collections import defaultdict
from datetime import datetime, timedelta
from statistics import mean, stdev
from typing import Dict, List, Optional, Tuple

from .schema import HourlyAggregate, MergedRecord, SensorReading, WeatherData


def _timestamps_match(ts_a: datetime, ts_b: datetime,
                      tolerance_seconds: int) -> bool:
    """Check whether two timestamps are within *tolerance_seconds* of each other.

    This performs a direct comparison / subtraction.  If one timestamp is
    timezone-aware and the other is naive, Python 3 raises TypeError on
    subtraction.  We catch that and return False so the caller silently
    skips the pair — this is the manifestation of the timezone bug.
    """
    try:
        delta = abs((ts_a - ts_b).total_seconds())
        return delta <= tolerance_seconds
    except TypeError:
        # Aware vs naive comparison — silently fail
        return False


def merge_datasets(
    sensor_data: List[SensorReading],
    weather_data: List[WeatherData],
    tolerance_seconds: int = 60,
) -> List[MergedRecord]:
    """Merge sensor readings with the closest weather observation.

    For each sensor reading, find the weather observation whose timestamp
    is within *tolerance_seconds*.  If multiple weather records match,
    pick the closest one.  Records with no match are dropped.

    Because sensor timestamps are UTC-aware and weather timestamps are
    naive (see loaders.py), the subtraction in _timestamps_match raises
    TypeError and every pair is silently skipped → the result list is
    empty even when the underlying times are identical.
    """
    merged: List[MergedRecord] = []

    for reading in sensor_data:
        best_weather: Optional[WeatherData] = None
        best_delta: float = float("inf")

        for obs in weather_data:
            if _timestamps_match(reading.timestamp, obs.timestamp,
                                 tolerance_seconds):
                try:
                    delta = abs(
                        (reading.timestamp - obs.timestamp).total_seconds())
                except TypeError:
                    continue
                if delta < best_delta:
                    best_delta = delta
                    best_weather = obs

        if best_weather is not None:
            merged.append(
                MergedRecord(
                    sensor_id=reading.sensor_id,
                    station_id=best_weather.station_id,
                    timestamp=reading.timestamp,
                    value=reading.value,
                    temperature=best_weather.temperature,
                    humidity=best_weather.humidity,
                ))
    return merged


def aggregate_hourly(merged_data: List[MergedRecord]) -> List[HourlyAggregate]:
    """Group merged records by hour and compute averages."""
    buckets: Dict[str, List[MergedRecord]] = defaultdict(list)

    for record in merged_data:
        hour_key = record.timestamp.strftime("%Y-%m-%dT%H:00:00")
        buckets[hour_key].append(record)

    aggregates: List[HourlyAggregate] = []
    for hour_key in sorted(buckets):
        group = buckets[hour_key]
        aggregates.append(
            HourlyAggregate(
                hour=hour_key,
                avg_value=mean(r.value for r in group),
                avg_temperature=mean(r.temperature for r in group),
                avg_humidity=mean(r.humidity for r in group),
                record_count=len(group),
            ))
    return aggregates


def filter_anomalies(
    data: List[MergedRecord],
    threshold: float = 3.0,
) -> List[MergedRecord]:
    """Remove statistical outliers based on the *value* field.

    Records whose value is more than *threshold* standard deviations from
    the mean are considered anomalies and excluded.

    Returns the original list unchanged if fewer than 2 records are
    provided (stdev is undefined for n < 2).
    """
    if len(data) < 2:
        return list(data)

    values = [r.value for r in data]
    mu = mean(values)
    sigma = stdev(values)

    if sigma == 0:
        return list(data)

    return [r for r in data if abs(r.value - mu) <= threshold * sigma]
