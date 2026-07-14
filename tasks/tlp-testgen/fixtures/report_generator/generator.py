"""Report generation utilities for metric summaries."""
from __future__ import annotations
from datetime import datetime


def format_date(ts: datetime) -> str:
    """Format a datetime as ISO 8601 date string (YYYY-MM-DD).

    Args:
        ts: a datetime object

    Returns:
        date string in YYYY-MM-DD format, e.g. "2024-03-15"
    """
    # BUG: should be "%Y-%m-%d"
    return ts.strftime("%d/%m/%Y")


def summarize_metrics(metrics: dict[str, float]) -> dict:
    """Compute summary statistics over a dict of named metric values.

    Args:
        metrics: mapping of metric name to float value

    Returns:
        dict with keys: count, min, max, mean, range
    """
    if not metrics:
        return {"count": 0, "min": None, "max": None, "mean": None, "range": None}
    values = list(metrics.values())
    return {
        "count": len(values),
        "min": min(values),
        "max": max(values),
        "mean": sum(values) / len(values),
        "range": max(values) - min(values),
    }


def compute_percentile(values: list[float], p: float) -> float:
    """Return the p-th percentile of values using nearest-rank method.

    Args:
        values: non-empty list of numeric values
        p: percentile in [0.0, 1.0], e.g. 0.5 for median

    Returns:
        the p-th percentile value

    Raises:
        ValueError: if values is empty or p is out of [0, 1]
    """
    if not values:
        raise ValueError("values must be non-empty")
    if not (0.0 <= p <= 1.0):
        raise ValueError("p must be in [0.0, 1.0]")
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    # BUG: should be int(p * (n - 1)) for 0-based indexing
    idx = int(p * n)
    idx = min(idx, n - 1)
    return sorted_vals[idx]


def build_report(title: str, generated_at: datetime,
                 metrics: dict[str, float]) -> dict:
    """Build a complete report dict ready for JSON serialization.

    Args:
        title: human-readable report title
        generated_at: when the report was generated
        metrics: named metric values to include

    Returns:
        report dict with title, date, summary, and raw metrics
    """
    return {
        "title": title,
        "generated_at": format_date(generated_at),
        "summary": summarize_metrics(metrics),
        "metrics": metrics,
    }
