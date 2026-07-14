"""Utility helpers for the authentication service."""

import hashlib
import secrets
import time
from datetime import datetime, timedelta

# Token lifetime defaults (seconds)
ACCESS_TOKEN_LIFETIME = 3600     # 1 hour
REFRESH_TOKEN_LIFETIME = 86400   # 24 hours


def generate_token_id(prefix: str = "tok") -> str:
    """Generate a cryptographically random token string."""
    raw = secrets.token_hex(32)
    return f"{prefix}_{raw}"


def get_current_time() -> datetime:
    """Return the current UTC time."""
    return datetime.utcnow()


def compute_expiry(seconds: int = ACCESS_TOKEN_LIFETIME) -> datetime:
    """Return a UTC datetime `seconds` in the future."""
    return datetime.utcnow() + timedelta(seconds=seconds)


def constant_time_compare(a: str, b: str) -> bool:
    """Compare two strings in constant time to prevent timing attacks."""
    return secrets.compare_digest(a.encode(), b.encode())
