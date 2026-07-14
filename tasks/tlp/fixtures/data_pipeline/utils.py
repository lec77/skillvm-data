"""Utility functions for the data pipeline."""

import csv
import json
from datetime import datetime, timezone
from statistics import mean, stdev
from typing import Any, Dict, List, Sequence


def parse_timestamp(ts_str: str, tz_aware: bool = True) -> datetime:
    """Parse an ISO-ish timestamp string.

    Args:
        ts_str: Timestamp like '2025-06-01T12:00:00'.
        tz_aware: If True, attach UTC timezone info.

    Returns:
        A datetime instance.
    """
    dt = datetime.strptime(ts_str.strip(), "%Y-%m-%dT%H:%M:%S")
    if tz_aware:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def compute_stats(values: Sequence[float]) -> Dict[str, float]:
    """Compute basic descriptive statistics for a numeric sequence."""
    if not values:
        return {"count": 0, "mean": 0.0, "stdev": 0.0, "min": 0.0, "max": 0.0}
    n = len(values)
    mu = mean(values)
    sd = stdev(values) if n >= 2 else 0.0
    return {
        "count": n,
        "mean": round(mu, 4),
        "stdev": round(sd, 4),
        "min": min(values),
        "max": max(values),
    }


def format_output(records: list, output_path: str) -> None:
    """Write a list of dataclass records to a JSON-lines file."""
    with open(output_path, "w") as fh:
        for rec in records:
            row = _dataclass_to_dict(rec)
            fh.write(json.dumps(row, default=str) + "\n")


def _dataclass_to_dict(obj: Any) -> Dict[str, Any]:
    """Convert a dataclass instance to a plain dict."""
    from dataclasses import fields as dc_fields
    return {f.name: getattr(obj, f.name) for f in dc_fields(obj)}
