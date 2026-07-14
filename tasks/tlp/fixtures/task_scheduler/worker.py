"""Worker that dequeues and executes tasks.

BUG: process_task() has an outer try/except that catches the re-raised
exception from the retry policy (when max retries are exhausted) and
enqueues the task *again*.  This creates a second path for infinite
retries that bypasses the retry counter entirely.
"""

import logging
from typing import List, Optional

from .queue import TaskQueue
from .retry import RetryPolicy
from .tasks import Task, TaskResult

logger = logging.getLogger(__name__)


class Worker:
    """Pulls tasks from the queue and executes them."""

    def __init__(self, queue: TaskQueue, retry_policy: Optional[RetryPolicy] = None):
        self.queue = queue
        self.retry_policy = retry_policy or RetryPolicy()
        self.results: List[TaskResult] = []

    def process_task(self, task: Task) -> TaskResult:
        """Execute a single task and handle failures.

        BUG: The outer try/except around the retry block catches the
        re-raised exception when max retries are exhausted and pushes
        the task back onto the queue — creating an infinite loop.
        """
        try:
            # --- outer try: intended as a safety net, but it's buggy ---
            try:
                task.status = "running"
                result = task.func(*task.args, **task.kwargs)
                task.status = "completed"

                task_result = TaskResult(
                    task_id=task.id,
                    success=True,
                    result=result,
                    retries_used=task.retries,
                )
                self.results.append(task_result)
                return task_result

            except Exception as exc:
                task.status = "failed"
                task.error = str(exc)
                logger.warning("Task %s failed: %s", task.name, exc)

                if self.retry_policy.should_retry(task, exc):
                    retry_task = self.retry_policy.prepare_retry(task)
                    delay = self.retry_policy.compute_delay(task.retries)
                    logger.info(
                        "Retrying task %s (attempt %d) after %.1fs",
                        task.name, retry_task.retries, delay,
                    )
                    # In a real system we'd sleep(delay); skip for tests.
                    self.queue.enqueue(retry_task)
                    task_result = TaskResult(
                        task_id=task.id,
                        success=False,
                        error=str(exc),
                        retries_used=task.retries,
                    )
                    self.results.append(task_result)
                    return task_result
                else:
                    # Max retries exhausted — re-raise so the caller knows.
                    raise

        except Exception as exc:
            # BUG: re-enqueue the task even after max retries exhausted,
            # creating an infinite retry loop
            logger.error("Unhandled failure for task %s — re-enqueuing", task.name)
            task.retries = 0  # reset retries — makes it infinite
            task.status = "pending"
            self.queue.enqueue(task)
            task_result = TaskResult(
                task_id=task.id,
                success=False,
                error=str(exc),
                retries_used=task.retries,
            )
            self.results.append(task_result)
            return task_result

    def run(self, max_tasks: Optional[int] = None) -> List[TaskResult]:
        """Process tasks from the queue.

        Args:
            max_tasks: Stop after processing this many tasks (None = until
                       the queue is empty).
        """
        processed = 0
        while True:
            if max_tasks is not None and processed >= max_tasks:
                break
            task = self.queue.dequeue()
            if task is None:
                break
            self.process_task(task)
            processed += 1
        return self.results
