"""Retry policy for failed tasks.

BUG: should_retry() does not check whether the error is retryable.
It treats ALL exceptions the same — including fatal errors like
ValueError and TypeError — as long as the retry count is below
MAX_RETRIES.  This means fatal errors are pointlessly retried
instead of being immediately rejected.
"""

from .config import MAX_RETRIES, RETRY_DELAY, BACKOFF_MULTIPLIER, MAX_DELAY
from .tasks import Task, clone_task


class RetryPolicy:
    """Decides whether a failed task should be retried."""

    def __init__(self, max_retries: int = MAX_RETRIES):
        self.max_retries = max_retries

    def should_retry(self, task: Task, error: Exception) -> bool:
        """Return True if the task should be retried.

        BUG: This only checks the retry count.  It should ALSO verify
        that ``type(error)`` is an instance of a retryable error
        (config.RETRYABLE_ERRORS) and return False for fatal errors.
        """
        # BUG: should check isinstance(error, RETRYABLE_ERRORS) but doesn't
        if task.retries < self.max_retries:
            return True
        return False

    def compute_delay(self, retries: int) -> float:
        """Compute exponential-backoff delay for the given retry number."""
        delay = RETRY_DELAY * (BACKOFF_MULTIPLIER ** retries)
        return min(delay, MAX_DELAY)

    def prepare_retry(self, task: Task) -> Task:
        """Return a cloned task ready for its next attempt."""
        retry_task = clone_task(task)
        retry_task.status = "retrying"
        return retry_task
