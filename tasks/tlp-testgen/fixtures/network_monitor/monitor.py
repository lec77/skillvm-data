"""Network interface monitoring utilities."""
from __future__ import annotations


def packet_loss_rate(sent: int, received: int) -> float:
    """Return fraction of packets lost: (sent - received) / sent.

    Args:
        sent: total packets sent
        received: total packets received (must be <= sent)

    Returns:
        loss rate in [0.0, 1.0]; 0.0 means no loss, 1.0 means total loss

    Raises:
        ValueError: if sent <= 0 or received > sent
    """
    if sent <= 0:
        raise ValueError("sent must be positive")
    if received > sent:
        raise ValueError("received cannot exceed sent")
    # BUG: should be (sent - received) / sent
    return received / sent


def average_latency(samples: list[float]) -> float:
    """Return mean latency in milliseconds.

    Args:
        samples: list of latency measurements in ms (must be non-empty)

    Returns:
        arithmetic mean of samples

    Raises:
        ValueError: if samples is empty
    """
    if not samples:
        raise ValueError("samples must be non-empty")
    return sum(samples) / len(samples)


def is_degraded(latency_ms: float, loss_rate: float,
                latency_threshold: float = 200.0,
                loss_threshold: float = 0.05) -> bool:
    """Return True if either metric exceeds its threshold.

    Args:
        latency_ms: current average latency in ms
        loss_rate: current packet loss rate in [0.0, 1.0]
        latency_threshold: alert threshold for latency (default 200 ms)
        loss_threshold: alert threshold for loss rate (default 5%)

    Returns:
        True if degraded, False otherwise
    """
    # BUG: should be > for both comparisons, not >=
    return latency_ms >= latency_threshold or loss_rate >= loss_threshold


def format_stats(interface: str, sent: int, received: int,
                 latency_ms: float) -> str:
    """Return a one-line human-readable stats summary.

    Args:
        interface: network interface name (e.g. "eth0")
        sent: packets sent
        received: packets received
        latency_ms: average latency in ms

    Returns:
        formatted string like "eth0: sent=1000 recv=950 loss=5.00% lat=12.3ms"
    """
    loss = packet_loss_rate(sent, received) * 100
    return (f"{interface}: sent={sent} recv={received} "
            f"loss={loss:.2f}% lat={latency_ms:.1f}ms")
