"""Data schemas for the sensor-weather data pipeline."""

from dataclasses import dataclass, fields
from datetime import datetime
from typing import Optional


@dataclass
class SensorReading:
    """A single reading from an IoT sensor."""
    sensor_id: str
    timestamp: datetime
    value: float
    unit: str


@dataclass
class WeatherData:
    """Weather observation from a monitoring station."""
    station_id: str
    timestamp: datetime
    temperature: float
    humidity: float


@dataclass
class MergedRecord:
    """A sensor reading merged with its closest weather observation."""
    sensor_id: str
    station_id: str
    timestamp: datetime
    value: float
    temperature: float
    humidity: float


@dataclass
class HourlyAggregate:
    """Hourly aggregation of merged records."""
    hour: str
    avg_value: float
    avg_temperature: float
    avg_humidity: float
    record_count: int
