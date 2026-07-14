"""Simple task queue backed by collections.deque."""

from collections import deque
from threading import Lock


class TaskQueue:
    """Thread-safe FIFO task queue with basic statistics tracking."""

    def __init__(self):
        self._queue = deque()
        self._lock = Lock()
        self._total_enqueued = 0
        self._total_dequeued = 0

    def enqueue(self, task):
        """Add a task to the back of the queue."""
        with self._lock:
            self._queue.append(task)
            self._total_enqueued += 1

    def dequeue(self):
        """Remove and return the task at the front of the queue.

        Returns None if the queue is empty.
        """
        with self._lock:
            if not self._queue:
                return None
            task = self._queue.popleft()
            self._total_dequeued += 1
            return task

    def peek(self):
        """Return the front task without removing it, or None if empty."""
        with self._lock:
            return self._queue[0] if self._queue else None

    def size(self):
        """Return the current number of tasks in the queue."""
        with self._lock:
            return len(self._queue)

    def clear(self):
        """Remove all tasks from the queue."""
        with self._lock:
            self._queue.clear()

    def get_stats(self):
        """Return a dictionary of queue statistics."""
        with self._lock:
            return {
                "total_enqueued": self._total_enqueued,
                "total_dequeued": self._total_dequeued,
                "current_size": len(self._queue),
            }

    def __len__(self):
        return self.size()

    def __bool__(self):
        return self.size() > 0
