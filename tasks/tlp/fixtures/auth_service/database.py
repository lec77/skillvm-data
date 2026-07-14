"""In-memory database for users and tokens."""

from typing import Dict, Optional

from .models import Token, User


class DatabaseError(Exception):
    """Raised when a database operation fails."""
    pass


class Database:
    """Simple in-memory store for users and tokens."""

    def __init__(self) -> None:
        self._users: Dict[str, User] = {}
        self._users_by_email: Dict[str, User] = {}
        self._tokens: Dict[str, Token] = {}

    def add_user(self, user: User) -> User:
        """Insert a new user record. Raises DatabaseError if email is taken."""
        if user.email in self._users_by_email:
            raise DatabaseError(f"Email already registered: {user.email}")
        self._users[user.user_id] = user
        self._users_by_email[user.email] = user
        return user

    def get_user(self, user_id: str) -> Optional[User]:
        """Look up a user by their unique ID."""
        return self._users.get(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Look up a user by email address."""
        return self._users_by_email.get(email)

    def store_token(self, token: Token) -> Token:
        """Persist a token record keyed by the access-token string."""
        self._tokens[token.token] = token
        return token

    def get_token(self, token_str: str) -> Optional[Token]:
        """Retrieve a token record by access-token string."""
        return self._tokens.get(token_str)

    def revoke_token(self, token_str: str) -> bool:
        """Mark a token as revoked. Returns True if the token existed."""
        token_record = self._tokens.get(token_str)
        if token_record is None:
            return False
        token_record.is_revoked = True
        return True

    def list_user_tokens(self, user_id: str) -> list:
        """Return all tokens belonging to a user (active and revoked)."""
        return [t for t in self._tokens.values() if t.user_id == user_id]

    def clear(self) -> None:
        """Wipe all data (useful for tests)."""
        self._users.clear()
        self._users_by_email.clear()
        self._tokens.clear()
