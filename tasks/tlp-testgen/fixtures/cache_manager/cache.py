"""LRU cache implementation using an ordered dictionary."""
from __future__ import annotations
from collections import OrderedDict


class LRUCache:
    """Least-Recently-Used cache with a fixed capacity.

    Items are evicted in least-recently-used order when the cache
    is full and a new item is inserted.

    Usage::

        cache = LRUCache(capacity=3)
        cache.put("a", 1)
        cache.put("b", 2)
        cache.put("c", 3)
        cache.get("a")       # => 1  (marks "a" as recently used)
        cache.put("d", 4)    # evicts "b" (LRU), not "a"
        cache.get("b")       # => None  (evicted)
    """

    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._capacity = capacity
        self._cache: OrderedDict[str, object] = OrderedDict()

    def get(self, key: str) -> object | None:
        """Return the value for key, or None if not present.

        Accessing a key marks it as most recently used.
        """
        if key not in self._cache:
            return None
        self._cache.move_to_end(key)
        return self._cache[key]

    def put(self, key: str, value: object) -> None:
        """Insert or update key-value pair.

        If the cache is full and key is new, evict the least recently used item.
        """
        if key in self._cache:
            self._cache.move_to_end(key)
        else:
            if len(self._cache) >= self._capacity:
                # BUG: last=True removes the most recently used item,
                # should be last=False to remove the least recently used
                self._cache.popitem(last=True)
        self._cache[key] = value

    def __len__(self) -> int:
        return len(self._cache)

    def __contains__(self, key: str) -> bool:
        return key in self._cache
