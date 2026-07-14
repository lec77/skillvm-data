"""Data loading functions for CSV ingestion."""

import csv
from datetime import datetime, timezone
from typing import List

from .schema import SensorReading, WeatherData


def load_sensor_data(filepath: str) -> List[SensorReading]:
    """Load sensor readings from a CSV file.

    Timestamps are parsed as UTC-aware datetimes.

    Args:
        filepath: Path to the sensor data CSV.

    Returns:
        List of SensorReading instances.
    """
    records = []
    with open(filepath, "r", newline="") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            ts_str = row["timestamp"].strip()
            # Parse ISO-format timestamp and attach UTC timezone
            ts = datetime.strptime(ts_str, "%Y-%m-%dT%H:%M:%S")
            ts = ts.replace(tzinfo=timezone.utc)
            reading = SensorReading(
                sensor_id=row["sensor_id"].strip(),
                timestamp=ts,
                value=float(row["value"]),
                unit=row["unit"].strip(),
            )
            records.append(reading)
    return records


def load_weather_data(filepath: str) -> List[WeatherData]:
    """Load weather observations from a CSV file.

    BUG: Timestamps are parsed as naive datetimes (no timezone info).
    The raw data is actually UTC, but we forget to attach the timezone.
    This causes silent mismatch when comparing with UTC-aware sensor
    timestamps downstream in the merge step.

    Args:
        filepath: Path to the weather data CSV.

    Returns:
        List of WeatherData instances.
    """
    records = []
    with open(filepath, "r", newline="") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            ts_str = row["timestamp"].strip()
            ts = datetime.strptime(ts_str, "%Y-%m-%dT%H:%M:%S")
            # BUG: missing ts = ts.replace(tzinfo=timezone.utc)
            # Weather timestamps are naive, but sensor timestamps are UTC-aware
            observation = WeatherData(
                station_id=row["station_id"].strip(),
                timestamp=ts,
                temperature=float(row["temperature"]),
                humidity=float(row["humidity"]),
            )
            records.append(observation)
    return records
