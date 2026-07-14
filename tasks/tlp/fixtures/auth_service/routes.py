"""Route handlers for the authentication API."""

import uuid
from typing import Any, Dict

from .auth import AuthError, AuthService
from .database import Database
from .middleware import AuthMiddleware
from .models import User


class RouteHandler:
    """Thin controller layer that wires HTTP-like calls to the auth service."""

    def __init__(self, db: Database, auth_service: AuthService,
                 middleware: AuthMiddleware) -> None:
        self.db = db
        self.auth = auth_service
        self.mw = middleware

    # ------------------------------------------------------------------ #
    # Public endpoints
    # ------------------------------------------------------------------ #
    def register(self, email: str, password: str) -> Dict[str, Any]:
        """Create a new user account."""
        user_id = str(uuid.uuid4())
        pw_hash = self.auth.hash_password(password)
        user = User(user_id=user_id, email=email, password_hash=pw_hash)
        self.db.add_user(user)
        return {"user_id": user_id, "email": email}

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate with email/password and receive a token pair."""
        user = self.db.get_user_by_email(email)
        if user is None:
            raise AuthError("Invalid credentials")
        if not self.auth.verify_password(password, user.password_hash):
            raise AuthError("Invalid credentials")
        token_dict = self.auth.create_token(user.user_id)
        return token_dict

    def refresh(self, old_token: str) -> Dict[str, Any]:
        """Exchange an old access token for a new pair."""
        return self.auth.refresh_token(old_token)

    # ------------------------------------------------------------------ #
    # Protected endpoints
    # ------------------------------------------------------------------ #
    def protected_resource(self, headers: Dict[str, str]) -> Dict[str, Any]:
        """Return a protected payload after verifying the token."""
        user_id = self.mw.authenticate(headers)
        user = self.db.get_user(user_id)
        return {
            "message": "Access granted",
            "user_id": user_id,
            "email": user.email if user else None,
        }

    def logout(self, token: str) -> Dict[str, str]:
        """Revoke the given access token."""
        self.db.revoke_token(token)
        self.mw.revoke_via_blacklist(token)
        return {"status": "logged_out"}
