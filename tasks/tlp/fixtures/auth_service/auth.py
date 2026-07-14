"""Core authentication logic: hashing, token creation, validation, refresh."""

import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple

from .database import Database
from .models import Token, User
from .utils import (
    ACCESS_TOKEN_LIFETIME,
    REFRESH_TOKEN_LIFETIME,
    compute_expiry,
    generate_token_id,
    get_current_time,
)


class AuthError(Exception):
    """Raised on any authentication failure."""
    pass


class AuthService:
    """Handles password hashing, token lifecycle, and validation."""

    def __init__(self, db: Database) -> None:
        self.db = db

    # ------------------------------------------------------------------ #
    # Password helpers
    # ------------------------------------------------------------------ #
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a plaintext password with a random salt (SHA-256)."""
        salt = secrets.token_hex(16)
        digest = hashlib.sha256(f"{salt}${password}".encode()).hexdigest()
        return f"{salt}${digest}"

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify a plaintext password against a stored hash."""
        try:
            salt, stored_digest = password_hash.split("$", 1)
        except ValueError:
            return False
        computed = hashlib.sha256(f"{salt}${password}".encode()).hexdigest()
        return secrets.compare_digest(computed, stored_digest)

    # ------------------------------------------------------------------ #
    # Token lifecycle
    # ------------------------------------------------------------------ #
    def create_token(self, user_id: str) -> Dict[str, str]:
        """Issue a new access + refresh token pair for *user_id*."""
        user = self.db.get_user(user_id)
        if user is None:
            raise AuthError(f"Unknown user: {user_id}")

        access = generate_token_id("acc")
        refresh = generate_token_id("ref")
        expires_at = compute_expiry(ACCESS_TOKEN_LIFETIME)

        token_record = Token(
            token=access,
            refresh_token=refresh,
            user_id=user_id,
            expires_at=expires_at,
        )
        self.db.store_token(token_record)

        return {
            "access_token": access,
            "refresh_token": refresh,
            "expires_at": expires_at.isoformat(),
            "token_type": "Bearer",
        }

    def refresh_token(self, old_access_token: str) -> Dict[str, str]:
        """Exchange an existing token for a fresh one.

        BUG: this method does NOT revoke the old token, so it remains
        usable even after a new token has been issued.  The fix would be:
            self.db.revoke_token(old_access_token)
        """
        old_record = self.db.get_token(old_access_token)
        if old_record is None:
            raise AuthError("Token not found")

        if old_record.is_revoked:
            raise AuthError("Token has been revoked")

        # Create a brand-new token pair for the same user
        new_token_dict = self.create_token(old_record.user_id)

        # BUG: old token is NOT revoked here — it remains valid
        # Missing: self.db.revoke_token(old_access_token)
        # Missing: update middleware blacklist

        return new_token_dict

    def validate_token(self, token_str: str) -> str:
        """Validate an access token and return the associated user_id.

        Raises AuthError if the token is missing, expired, or revoked.
        """
        record = self.db.get_token(token_str)
        if record is None:
            raise AuthError("Invalid token")

        if record.is_revoked:
            raise AuthError("Token has been revoked")

        if record.is_expired:
            raise AuthError("Token has expired")

        return record.user_id
