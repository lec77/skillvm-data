"""API gateway utilities: rate limiting and request routing."""
from __future__ import annotations
import time


class RateLimiter:
    """Token-bucket style rate limiter.

    Allows up to `limit` requests per `window_seconds` window.
    The window resets after `window_seconds` seconds from the first request.

    Usage::

        limiter = RateLimiter(limit=3, window_seconds=60)
        limiter.is_allowed("user-1")   # True  (count 1/3)
        limiter.is_allowed("user-1")   # True  (count 2/3)
        limiter.is_allowed("user-1")   # True  (count 3/3)
        limiter.is_allowed("user-1")   # False (over limit)
    """

    def __init__(self, limit: int, window_seconds: float = 60.0) -> None:
        if limit <= 0:
            raise ValueError("limit must be positive")
        self._limit = limit
        self._window = window_seconds
        self._counts: dict[str, int] = {}
        self._windows: dict[str, float] = {}

    def is_allowed(self, client_id: str) -> bool:
        """Return True if the request is within the rate limit.

        Resets the window if window_seconds have elapsed since the first
        request in the current window.
        """
        now = time.monotonic()
        if client_id not in self._counts:
            self._counts[client_id] = 0
            self._windows[client_id] = now

        # Reset window if expired
        if now - self._windows[client_id] >= self._window:
            self._counts[client_id] = 0
            self._windows[client_id] = now

        self._counts[client_id] += 1
        # BUG: inverted — should be self._counts[client_id] <= self._limit
        return self._counts[client_id] > self._limit

    def remaining(self, client_id: str) -> int:
        """Return the number of requests remaining in the current window."""
        count = self._counts.get(client_id, 0)
        return max(0, self._limit - count)

    def reset(self, client_id: str) -> None:
        """Manually reset the counter for a client."""
        self._counts.pop(client_id, None)
        self._windows.pop(client_id, None)


class Router:
    """Simple path-based request router.

    Routes are matched in registration order; the first match wins.
    Supports exact matches and prefix matches (routes ending in '/*').
    """

    def __init__(self) -> None:
        self._routes: list[tuple[str, str, bool]] = []  # (pattern, handler, is_prefix)

    def add_route(self, pattern: str, handler: str) -> None:
        """Register a route pattern and its handler name.

        Patterns ending with '/*' match any path with that prefix.
        All other patterns are exact matches.
        """
        is_prefix = pattern.endswith("/*")
        if is_prefix:
            pattern = pattern[:-2]  # strip "/*"
        self._routes.append((pattern, handler, is_prefix))

    def resolve(self, path: str) -> str | None:
        """Return the handler name for path, or None if no route matches."""
        for pattern, handler, is_prefix in self._routes:
            if is_prefix:
                if path.startswith(pattern):
                    return handler
            else:
                if path == pattern:
                    return handler
        return None
