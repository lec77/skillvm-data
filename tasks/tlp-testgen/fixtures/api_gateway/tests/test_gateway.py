"""Tests for api_gateway.gateway."""
import sys
import os
import pytest
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from gateway import RateLimiter, Router


# ── RateLimiter tests ──────────────────────────────────────────────────────


def test_rate_limiter_allows_under_limit():
    limiter = RateLimiter(limit=3, window_seconds=60)
    assert limiter.is_allowed("user") is True
    assert limiter.is_allowed("user") is True
    assert limiter.is_allowed("user") is True


def test_rate_limiter_blocks_over_limit():
    limiter = RateLimiter(limit=3, window_seconds=60)
    limiter.is_allowed("user")
    limiter.is_allowed("user")
    limiter.is_allowed("user")
    assert limiter.is_allowed("user") is False


def test_rate_limiter_first_request_allowed():
    limiter = RateLimiter(limit=1, window_seconds=60)
    assert limiter.is_allowed("client") is True


def test_rate_limiter_second_request_blocked_at_limit_1():
    limiter = RateLimiter(limit=1, window_seconds=60)
    limiter.is_allowed("client")
    assert limiter.is_allowed("client") is False


def test_rate_limiter_independent_clients():
    limiter = RateLimiter(limit=2, window_seconds=60)
    limiter.is_allowed("alice")
    limiter.is_allowed("alice")
    # alice is blocked; bob should be unaffected
    assert limiter.is_allowed("alice") is False
    assert limiter.is_allowed("bob") is True


def test_rate_limiter_remaining():
    limiter = RateLimiter(limit=5, window_seconds=60)
    limiter.is_allowed("u")
    limiter.is_allowed("u")
    assert limiter.remaining("u") == 3


def test_rate_limiter_reset():
    limiter = RateLimiter(limit=2, window_seconds=60)
    limiter.is_allowed("u")
    limiter.is_allowed("u")
    assert limiter.is_allowed("u") is False
    limiter.reset("u")
    assert limiter.is_allowed("u") is True


def test_rate_limiter_invalid_limit():
    with pytest.raises(ValueError):
        RateLimiter(limit=0)


# ── Router tests ────────────────────────────────────────────────────────────


def test_router_exact_match():
    r = Router()
    r.add_route("/api/users", "users_handler")
    assert r.resolve("/api/users") == "users_handler"


def test_router_no_match():
    r = Router()
    r.add_route("/api/users", "users_handler")
    assert r.resolve("/api/orders") is None


def test_router_prefix_match():
    r = Router()
    r.add_route("/api/*", "api_handler")
    assert r.resolve("/api/anything") == "api_handler"
    assert r.resolve("/api/nested/path") == "api_handler"


def test_router_exact_before_prefix():
    r = Router()
    r.add_route("/api/users", "exact_handler")
    r.add_route("/api/*", "prefix_handler")
    assert r.resolve("/api/users") == "exact_handler"


def test_router_multiple_routes():
    r = Router()
    r.add_route("/health", "health_handler")
    r.add_route("/api/*", "api_handler")
    r.add_route("/static/*", "static_handler")
    assert r.resolve("/health") == "health_handler"
    assert r.resolve("/api/v1") == "api_handler"
    assert r.resolve("/static/img") == "static_handler"
    assert r.resolve("/unknown") is None
