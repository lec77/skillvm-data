"""Tests for the JWT authentication service.

Expected results when the bug is present:
    9 PASS, 3 FAIL
The three failing tests expose the missing revocation in refresh_token().
"""

import time
from datetime import datetime, timedelta

import pytest

from auth_service.auth import AuthError, AuthService
from auth_service.database import Database
from auth_service.middleware import AuthMiddleware
from auth_service.models import Token, User
from auth_service.routes import RouteHandler


# -------------------------------------------------------------------- #
# Fixtures
# -------------------------------------------------------------------- #

@pytest.fixture(autouse=True)
def _clear_blacklist():
    """Reset the middleware blacklist between tests."""
    AuthMiddleware.clear_blacklist()
    yield
    AuthMiddleware.clear_blacklist()


@pytest.fixture
def db():
    return Database()


@pytest.fixture
def auth(db):
    return AuthService(db)


@pytest.fixture
def middleware(auth):
    return AuthMiddleware(auth)


@pytest.fixture
def routes(db, auth, middleware):
    return RouteHandler(db, auth, middleware)


@pytest.fixture
def registered_user(routes):
    """Register a user and return (email, password, user_info)."""
    email, password = "alice@example.com", "s3cretP@ss!"
    info = routes.register(email, password)
    return email, password, info


# -------------------------------------------------------------------- #
# PASSING TESTS (9)
# -------------------------------------------------------------------- #

def test_create_user(db, auth):
    """Users can be created and retrieved."""
    pw_hash = auth.hash_password("password123")
    user = User(user_id="u1", email="bob@test.com", password_hash=pw_hash)
    db.add_user(user)
    assert db.get_user("u1") is user
    assert db.get_user_by_email("bob@test.com") is user


def test_login_valid(routes, registered_user):
    """Valid credentials return a token pair."""
    email, password, _ = registered_user
    token = routes.login(email, password)
    assert "access_token" in token
    assert "refresh_token" in token
    assert token["token_type"] == "Bearer"


def test_login_invalid_password(routes, registered_user):
    """Wrong password raises AuthError."""
    email, _, _ = registered_user
    with pytest.raises(AuthError, match="Invalid credentials"):
        routes.login(email, "wrong_password")


def test_create_token(db, auth):
    """create_token issues tokens that are stored in the database."""
    pw_hash = auth.hash_password("x")
    db.add_user(User(user_id="u2", email="c@d.com", password_hash=pw_hash))
    result = auth.create_token("u2")
    stored = db.get_token(result["access_token"])
    assert stored is not None
    assert stored.user_id == "u2"
    assert stored.is_revoked is False


def test_validate_token(auth, db):
    """A freshly issued token validates successfully."""
    pw_hash = auth.hash_password("x")
    db.add_user(User(user_id="u3", email="e@f.com", password_hash=pw_hash))
    tok = auth.create_token("u3")
    uid = auth.validate_token(tok["access_token"])
    assert uid == "u3"


def test_token_expiry(auth, db):
    """An expired token is rejected."""
    pw_hash = auth.hash_password("x")
    db.add_user(User(user_id="u4", email="g@h.com", password_hash=pw_hash))
    tok = auth.create_token("u4")
    # Manually expire the token
    record = db.get_token(tok["access_token"])
    record.expires_at = datetime.utcnow() - timedelta(seconds=10)
    with pytest.raises(AuthError, match="expired"):
        auth.validate_token(tok["access_token"])


def test_logout(routes, registered_user):
    """After logout the token is rejected."""
    email, password, _ = registered_user
    tok = routes.login(email, password)
    routes.logout(tok["access_token"])
    with pytest.raises(AuthError):
        auth_svc = routes.auth
        auth_svc.validate_token(tok["access_token"])


def test_protected_access(routes, registered_user):
    """A valid token grants access to a protected resource."""
    email, password, _ = registered_user
    tok = routes.login(email, password)
    headers = {"Authorization": f"Bearer {tok['access_token']}"}
    result = routes.protected_resource(headers)
    assert result["message"] == "Access granted"
    assert result["email"] == email


def test_invalid_token(routes):
    """A completely unknown token is rejected."""
    headers = {"Authorization": "Bearer totally_bogus_token"}
    with pytest.raises(AuthError):
        routes.protected_resource(headers)


# -------------------------------------------------------------------- #
# FAILING TESTS (3) — expose the refresh-revocation bug
# -------------------------------------------------------------------- #

def test_token_reuse_after_refresh(routes, registered_user):
    """After refreshing, the OLD access token should be rejected.

    This test FAILS because refresh_token() does not revoke the old token.
    """
    email, password, _ = registered_user
    old_tok = routes.login(email, password)
    _new_tok = routes.refresh(old_tok["access_token"])

    # The old token should now be invalid
    with pytest.raises(AuthError):
        routes.auth.validate_token(old_tok["access_token"])


def test_blacklist_updated_on_refresh(routes, registered_user, middleware):
    """The middleware blacklist should contain the old token after refresh.

    This test FAILS because refresh_token() never updates the blacklist.
    """
    email, password, _ = registered_user
    old_tok = routes.login(email, password)
    _new_tok = routes.refresh(old_tok["access_token"])

    blacklist = middleware.get_blacklist()
    assert old_tok["access_token"] in blacklist, (
        "Old token should appear in the blacklist after refresh"
    )


def test_concurrent_refresh_safety(routes, registered_user):
    """Refreshing the same token twice should fail the second time.

    This test FAILS because the old token is never revoked, so both
    refresh calls succeed — effectively doubling active sessions.
    """
    email, password, _ = registered_user
    tok = routes.login(email, password)

    # First refresh should succeed
    routes.refresh(tok["access_token"])

    # Second refresh of the SAME old token should be rejected
    with pytest.raises(AuthError):
        routes.refresh(tok["access_token"])
