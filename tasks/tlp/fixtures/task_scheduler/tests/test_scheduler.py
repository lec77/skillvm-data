"""Tests for the task scheduler.

8 tests PASS, 3 tests FAIL.

The 3 failing tests expose two bugs:
  1. retry.py: should_retry() ignores error type (retries fatal errors).
  2. worker.py: outer except re-enqueues tasks after max retries, creating
     an infinite retry loop.
"""

import pytest

from task_scheduler.scheduler import Scheduler
from task_scheduler.retry import RetryPolicy
from task_scheduler.queue import TaskQueue
from task_scheduler.tasks import create_task, clone_task


# ---------------------------------------------------------------------------
# Helper callables
# ---------------------------------------------------------------------------

def succeeding_task(x, y):
    """Simple function that always succeeds."""
    return x + y


def connection_error_task():
    """Simulates a transient network failure."""
    raise ConnectionError("connection refused")


def value_error_task():
    """Simulates a fatal data-validation error."""
    raise ValueError("invalid input data")


call_count = 0

def flaky_task():
    """Fails twice with ConnectionError, then succeeds."""
    global call_count
    call_count += 1
    if call_count <= 2:
        raise ConnectionError("temporary failure")
    return "ok"


# ---------------------------------------------------------------------------
# PASSING tests
# ---------------------------------------------------------------------------

class TestSchedulerPass:
    """Tests that exercise the happy path and basic retry mechanics."""

    def test_schedule_simple_task(self):
        """A task can be scheduled and appears in the queue."""
        scheduler = Scheduler()
        task = scheduler.schedule_task("add", succeeding_task, 1, 2)
        assert scheduler.pending_count() == 1
        assert task.name == "add"

    def test_successful_execution(self):
        """A successful task produces a positive result."""
        scheduler = Scheduler()
        scheduler.schedule_task("add", succeeding_task, 3, 4)
        scheduler.run(max_iterations=10)
        results = scheduler.get_results()
        assert len(results) == 1
        assert results[0].success is True
        assert results[0].result == 7

    def test_retry_on_connection_error(self):
        """ConnectionError triggers retries (bug still retries, so this passes)."""
        scheduler = Scheduler(max_retries=3)
        scheduler.schedule_task("net", connection_error_task)
        scheduler.run(max_iterations=20)
        # The task is retried up to max_retries times (passes because
        # the bug retries everything, including ConnectionError).
        results = scheduler.get_results()
        assert len(results) > 1  # original + retries produced results

    def test_exponential_backoff(self):
        """compute_delay returns exponentially increasing values."""
        policy = RetryPolicy()
        assert policy.compute_delay(0) == 1.0
        assert policy.compute_delay(1) == 2.0
        assert policy.compute_delay(2) == 4.0
        assert policy.compute_delay(3) == 8.0

    def test_task_result_tracking(self):
        """Results are accumulated across multiple tasks."""
        scheduler = Scheduler()
        scheduler.schedule_task("a", succeeding_task, 1, 1)
        scheduler.schedule_task("b", succeeding_task, 2, 2)
        scheduler.run(max_iterations=10)
        results = scheduler.get_results()
        assert len(results) == 2
        assert all(r.success for r in results)

    def test_max_retries_with_retryable_error(self):
        """Retryable errors produce retry results up to the limit."""
        scheduler = Scheduler(max_retries=2)
        scheduler.schedule_task("conn", connection_error_task)
        scheduler.run(max_iterations=20)
        results = scheduler.get_results()
        # We expect at least 3 result entries (original + 2 retries).
        assert len(results) >= 3

    def test_queue_operations(self):
        """Basic TaskQueue operations work correctly."""
        q = TaskQueue()
        t = create_task("t", succeeding_task, 0, 0)
        q.enqueue(t)
        assert q.size() == 1
        assert q.peek() is t
        out = q.dequeue()
        assert out is t
        assert q.size() == 0
        stats = q.get_stats()
        assert stats["total_enqueued"] == 1
        assert stats["total_dequeued"] == 1

    def test_multiple_tasks(self):
        """Multiple independent tasks all complete successfully."""
        scheduler = Scheduler()
        for i in range(5):
            scheduler.schedule_task(f"add-{i}", succeeding_task, i, i)
        scheduler.run(max_iterations=10)
        results = scheduler.get_results()
        assert len(results) == 5
        assert all(r.success for r in results)


# ---------------------------------------------------------------------------
# FAILING tests — they expose the two bugs
# ---------------------------------------------------------------------------

class TestSchedulerFail:
    """Tests that fail because of the retry bugs."""

    def test_fatal_error_no_retry(self):
        """ValueError is fatal and should NOT be retried.

        BUG: retry.py's should_retry() doesn't check error type, so
        ValueError gets retried just like ConnectionError.
        """
        scheduler = Scheduler(max_retries=3)
        scheduler.schedule_task("bad", value_error_task)
        scheduler.run(max_iterations=20)

        results = scheduler.get_results()
        # With correct behaviour there should be exactly 1 result
        # (immediate failure, no retries).
        retry_count = sum(1 for r in results if not r.success)
        assert retry_count == 1, (
            f"Fatal ValueError was retried {retry_count - 1} times; "
            "expected 0 retries"
        )

    def test_max_retries_respected(self):
        """After MAX_RETRIES exhausted, the task must NOT reappear.

        BUG: worker.py's outer except catches the re-raised exception
        and pushes the task back onto the queue with retries reset to 0.
        """
        scheduler = Scheduler(max_retries=3)
        scheduler.schedule_task("conn", connection_error_task)
        scheduler.run(max_iterations=50)

        stats = scheduler.get_queue_stats()
        # After the run the queue should be completely drained.
        assert stats["current_size"] == 0, (
            f"Queue still has {stats['current_size']} tasks; "
            "task was re-enqueued after max retries"
        )

    def test_queue_not_flooded(self):
        """Processing a fatal-error task should not grow the queue.

        BUG: Because fatal errors are retried AND the outer except
        re-enqueues, total_enqueued grows far beyond 1.
        """
        scheduler = Scheduler(max_retries=3)
        scheduler.schedule_task("bad", value_error_task)
        scheduler.run(max_iterations=30)

        stats = scheduler.get_queue_stats()
        # Correct behaviour: 1 enqueue (the original schedule), 1 dequeue.
        assert stats["total_enqueued"] <= 2, (
            f"Queue saw {stats['total_enqueued']} enqueues; "
            "expected at most 2 (schedule + 0–1 retries). "
            "Fatal errors are flooding the queue."
        )
