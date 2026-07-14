"""Main pipeline orchestrator."""

from typing import Any, Dict, Optional

from .loaders import load_sensor_data, load_weather_data
from .transformers import aggregate_hourly, filter_anomalies, merge_datasets
from .utils import format_output
from .validators import validate_completeness, validate_ranges, validate_schema


def run_pipeline(
    sensor_file: str,
    weather_file: str,
    output_file: Optional[str] = None,
    tolerance_seconds: int = 60,
    anomaly_threshold: float = 3.0,
) -> Dict[str, Any]:
    """Execute the full data pipeline.

    Steps:
        1. Load sensor readings (UTC-aware timestamps).
        2. Load weather observations (naive timestamps — the bug).
        3. Merge on timestamp proximity.
        4. Validate merged output.
        5. Filter anomalies.
        6. Aggregate hourly.
        7. Export results.

    Returns:
        Summary dict with record counts at each stage.
    """
    summary: Dict[str, Any] = {}

    # --- 1. Load ---
    sensor_data = load_sensor_data(sensor_file)
    weather_data = load_weather_data(weather_file)
    summary["sensor_records_loaded"] = len(sensor_data)
    summary["weather_records_loaded"] = len(weather_data)

    # --- 2. Merge ---
    merged = merge_datasets(sensor_data, weather_data, tolerance_seconds)
    summary["merged_records"] = len(merged)

    # --- 3. Validate ---
    schema_ok, schema_msg = validate_schema(
        merged,
        {"sensor_id", "station_id", "timestamp", "value", "temperature", "humidity"},
    )
    summary["schema_valid"] = schema_ok
    summary["schema_message"] = schema_msg

    comp_ok, comp_msg = validate_completeness(
        merged, len(sensor_data), len(weather_data),
    )
    summary["completeness_valid"] = comp_ok
    summary["completeness_message"] = comp_msg

    # --- 4. Filter anomalies ---
    cleaned = filter_anomalies(merged, threshold=anomaly_threshold)
    summary["records_after_anomaly_filter"] = len(cleaned)

    # --- 5. Aggregate ---
    hourly = aggregate_hourly(cleaned)
    summary["hourly_buckets"] = len(hourly)

    # --- 6. Export ---
    if output_file is not None and cleaned:
        format_output(cleaned, output_file)
        summary["output_file"] = output_file

    return summary
