"""Tests for cache_manager.cache."""
import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from cache import LRUCache


def test_basic_put_get():
    c = LRUCache(3)
    c.put("x", 10)
    assert c.get("x") == 10


def test_get_missing_returns_none():
    c = LRUCache(3)
    assert c.get("nope") is None


def test_update_existing():
    c = LRUCache(3)
    c.put("x", 1)
    c.put("x", 99)
    assert c.get("x") == 99
    assert len(c) == 1


def test_capacity_respected():
    c = LRUCache(2)
    c.put("a", 1)
    c.put("b", 2)
    c.put("c", 3)
    assert len(c) == 2


def test_lru_eviction_order():
    """The least recently used item should be evicted, not the most recent."""
    c = LRUCache(3)
    c.put("a", 1)  # LRU order: [a]
    c.put("b", 2)  # LRU order: [a, b]
    c.put("c", 3)  # LRU order: [a, b, c]
    c.get("a")     # LRU order: [b, c, a]  — "a" is now most recent
    c.put("d", 4)  # should evict "b" (least recently used)
    assert c.get("b") is None, "b should have been evicted (it is LRU)"
    assert c.get("a") == 1, "a should still be in cache (recently used)"
    assert c.get("c") == 3
    assert c.get("d") == 4


def test_lru_eviction_without_access():
    """Without any gets, first inserted is evicted first."""
    c = LRUCache(2)
    c.put("first", 1)
    c.put("second", 2)
    c.put("third", 3)  # should evict "first"
    assert c.get("first") is None
    assert c.get("second") == 2
    assert c.get("third") == 3


def test_contains():
    c = LRUCache(2)
    c.put("k", "v")
    assert "k" in c
    assert "z" not in c


def test_invalid_capacity():
    with pytest.raises(ValueError):
        LRUCache(0)
