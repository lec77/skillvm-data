"""Task and result dataclasses."""

from dataclasses import dataclass, field
from typing import Any, Callable, Dict, Optional, Tuple
import uuid


@dataclass
class Task:
    """Represents a unit of work to be scheduled and executed."""

    id: str
    name: str
    func: Callable
    args: Tuple = ()
    kwargs: Dict[str, Any] = field(default_factory=dict)
    retries: int = 0
    status: str = "pending"
    error: Optional[str] = None


@dataclass
class TaskResult:
    """Outcome of a task execution attempt."""

    task_id: str
    success: bool
    result: Any = None
    error: Optional[str] = None
    retries_used: int = 0


def create_task(name: str, func: Callable, *args, **kwargs) -> Task:
    """Create a new Task with a unique ID."""
    return Task(
        id=str(uuid.uuid4()),
        name=name,
        func=func,
        args=args,
        kwargs=kwargs,
    )


def clone_task(task: Task) -> Task:
    """Clone a task for retry, incrementing the retry counter."""
    return Task(
        id=task.id,
        name=task.name,
        func=task.func,
        args=task.args,
        kwargs=task.kwargs,
        retries=task.retries + 1,
        status="pending",
        error=None,
    )
