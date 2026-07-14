"""Configuration constants for the task scheduler."""

# Maximum number of retry attempts before giving up on a task.
MAX_RETRIES = 3

# Base delay (in seconds) between retry attempts.
RETRY_DELAY = 1.0

# Backoff multiplier for exponential delay calculation.
BACKOFF_MULTIPLIER = 2.0

# Maximum delay cap to prevent excessively long waits.
MAX_DELAY = 30.0

# Errors that are transient and safe to retry.
RETRYABLE_ERRORS = (ConnectionError, TimeoutError, OSError)

# Errors that indicate a logic or data problem; retrying won't help.
FATAL_ERRORS = (ValueError, TypeError, KeyError)

# Default maximum iterations for the scheduler run loop.
DEFAULT_MAX_ITERATIONS = 100

# Worker poll interval when the queue is empty (seconds).
POLL_INTERVAL = 0.1
