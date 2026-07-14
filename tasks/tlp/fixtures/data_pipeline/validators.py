"""Validation helpers for data quality checks."""

from dataclasses import fields as dc_fields
from typing import Any, Dict, List, Set, Tuple


def validate_schema(records: list, expected_fields: Set[str]) -> Tuple[bool, str]:
    """Verify that every record contains all *expected_fields*.

    Args:
        records: List of dataclass instances.
        expected_fields: Set of field names that must be present.

    Returns:
        (ok, message) tuple.
    """
    if not records:
        return True, "No records to validate."

    for idx, record in enumerate(records):
        record_fields = {f.name for f in dc_fields(record)}
        missing = expected_fields - record_fields
        if missing:
            return False, f"Record {idx} missing fields: {sorted(missing)}"
    return True, "Schema validation passed."


def validate_completeness(
    merged: list,
    sensor_count: int,
    weather_count: int,
) -> Tuple[bool, str]:
    """Check that the merge did not lose an unreasonable number of records.

    We expect the merged set to contain at least as many records as the
    smaller of the two inputs (assuming a roughly 1:1 temporal overlap).
    """
    expected_min = min(sensor_count, weather_count)
    actual = len(merged)
    if actual < expected_min:
        return (
            False,
            f"Merge dropped records: expected >= {expected_min}, got {actual}",
        )
    return True, f"Completeness check passed ({actual} records)."


def validate_ranges(
    records: list,
    field_ranges: Dict[str, Tuple[float, float]],
) -> Tuple[bool, str]:
    """Ensure numeric fields fall within expected [lo, hi] ranges.

    Args:
        records: List of dataclass instances.
        field_ranges: Mapping of field name → (min, max).

    Returns:
        (ok, message) tuple.
    """
    for idx, record in enumerate(records):
        for field_name, (lo, hi) in field_ranges.items():
            val = getattr(record, field_name, None)
            if val is None:
                continue
            if not (lo <= val <= hi):
                return (
                    False,
                    f"Record {idx}: {field_name}={val} outside [{lo}, {hi}]",
                )
    return True, "Range validation passed."
