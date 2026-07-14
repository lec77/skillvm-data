"""Request middleware for token-based authentication."""

from typing import Any, Dict, Optional

from .auth import AuthError, AuthService

# Fast-lookup blacklist intended to cache revoked tokens so that the
# middleware can reject them without hitting the database.  However,
# because refresh_token() never adds the old token here, this set
# stays empty after a refresh — which is part of the bug.
_token_blacklist: set = set()


class AuthMiddleware:
    """Sits in front of route handlers and enforces authentication."""

    def __init__(self, auth_service: AuthService) -> None:
        self.auth_service = auth_service

    def authenticate(self, headers: Dict[str, str]) -> str:
        """Extract and validate a Bearer token from request headers.

        Returns the *user_id* associated with the token.
        Raises AuthError on any failure.
        """
        auth_header = headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise AuthError("Missing or malformed Authorization header")

        token_str = auth_header[len("Bearer "):]

        # Quick reject from the in-memory blacklist
        if token_str in _token_blacklist:
            raise AuthError("Token has been revoked (blacklist)")

        # Full validation via the auth service
        user_id = self.auth_service.validate_token(token_str)
        return user_id

    def revoke_via_blacklist(self, token_str: str) -> None:
        """Add a token to the fast-lookup blacklist."""
        _token_blacklist.add(token_str)

    @staticmethod
    def clear_blacklist() -> None:
        """Reset the blacklist (useful for tests)."""
        _token_blacklist.clear()

    @staticmethod
    def get_blacklist() -> set:
        """Return a copy of the current blacklist."""
        return set(_token_blacklist)
