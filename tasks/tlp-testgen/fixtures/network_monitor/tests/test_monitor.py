"""Tests for network_monitor.monitor."""
import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from monitor import packet_loss_rate, average_latency, is_degraded, format_stats


def test_packet_loss_no_loss():
    assert packet_loss_rate(1000, 1000) == pytest.approx(0.0)


def test_packet_loss_partial():
    # 50 packets lost out of 1000 = 5% loss
    assert packet_loss_rate(1000, 950) == pytest.approx(0.05)


def test_packet_loss_total():
    assert packet_loss_rate(100, 0) == pytest.approx(1.0)


def test_packet_loss_single():
    assert packet_loss_rate(4, 3) == pytest.approx(0.25)


def test_packet_loss_invalid_sent():
    with pytest.raises(ValueError):
        packet_loss_rate(0, 0)


def test_packet_loss_received_exceeds_sent():
    with pytest.raises(ValueError):
        packet_loss_rate(100, 101)


def test_average_latency_basic():
    assert average_latency([10.0, 20.0, 30.0]) == pytest.approx(20.0)


def test_average_latency_single():
    assert average_latency([42.5]) == pytest.approx(42.5)


def test_average_latency_empty():
    with pytest.raises(ValueError):
        average_latency([])


def test_is_degraded_high_latency():
    assert is_degraded(201.0, 0.0) is True


def test_is_degraded_high_loss():
    assert is_degraded(50.0, 0.06) is True


def test_is_degraded_both_ok():
    assert is_degraded(199.0, 0.04) is False


def test_is_degraded_exactly_at_threshold():
    # 200ms latency and 5% loss are NOT degraded (strict >)
    assert is_degraded(200.0, 0.05) is False


def test_format_stats_basic():
    result = format_stats("eth0", 1000, 950, 12.3)
    assert "eth0" in result
    assert "5.00%" in result
    assert "12.3ms" in result
