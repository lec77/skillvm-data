"""Data models for the authentication service."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class User:
    """Represents a registered user."""
    user_id: str
    email: str
    password_hash: str
    created_at: datetime = field(default_factory=datetime.utcnow)
    is_active: bool = True

    def __repr__(self) -> str:
        return f"User(user_id={self.user_id!r}, email={self.email!r})"


@dataclass
class Token:
    """Represents an issued authentication token."""
    token: str
    refresh_token: str
    user_id: str
    expires_at: datetime
    is_revoked: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self) -> bool:
        return not self.is_revoked and not self.is_expired

    def __repr__(self) -> str:
        return (
            f"Token(token={self.token[:12]!r}..., user_id={self.user_id!r}, "
            f"revoked={self.is_revoked}, expired={self.is_expired})"
        )
