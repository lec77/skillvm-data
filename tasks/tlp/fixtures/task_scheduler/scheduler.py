"""High-level scheduler that ties the queue, retry policy, and worker together."""

import logging
from typing import Any, Callable, Dict, List, Optional

from .config import DEFAULT_MAX_ITERATIONS
from .queue import TaskQueue
from .retry import RetryPolicy
from .tasks import Task, TaskResult, create_task
from .worker import Worker

logger = logging.getLogger(__name__)


class Scheduler:
    """Manages task submission and execution."""

    def __init__(self, max_retries: int = 3):
        self.queue = TaskQueue()
        self.retry_policy = RetryPolicy(max_retries=max_retries)
        self.worker = Worker(self.queue, self.retry_policy)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def schedule_task(self, name: str, func: Callable, *args: Any, **kwargs: Any) -> Task:
        """Create a task and add it to the queue.

        Returns the Task object (useful for tracking its ID).
        """
        task = create_task(name, func, *args, **kwargs)
        self.queue.enqueue(task)
        logger.info("Scheduled task %s (id=%s)", name, task.id)
        return task

    def run(self, max_iterations: int = DEFAULT_MAX_ITERATIONS) -> List[TaskResult]:
        """Run the worker loop for at most *max_iterations* task dequeues.

        The iteration cap prevents run-away loops during testing while
        still allowing realistic multi-retry flows in production.
        """
        logger.info("Starting scheduler run (max_iterations=%d)", max_iterations)
        results = self.worker.run(max_tasks=max_iterations)
        logger.info(
            "Scheduler run complete: %d results, %d tasks still queued",
            len(results), self.queue.size(),
        )
        return results

    def get_results(self) -> List[TaskResult]:
        """Return all TaskResult objects collected so far."""
        return list(self.worker.results)

    def get_queue_stats(self) -> Dict[str, int]:
        """Return current queue statistics."""
        return self.queue.get_stats()

    # ------------------------------------------------------------------
    # Convenience helpers
    # ------------------------------------------------------------------

    def pending_count(self) -> int:
        """Number of tasks waiting in the queue."""
        return self.queue.size()

    def clear(self) -> None:
        """Drop all pending tasks and recorded results."""
        self.queue.clear()
        self.worker.results.clear()
