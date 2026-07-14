---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing, concurrent.futures, or asyncio. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

Transform sequential Python into parallel code using `multiprocessing.Pool` or `concurrent.futures.ProcessPoolExecutor`.

## Critical Rules

1. **Always** use `if __name__ == '__main__':` guard — required on macOS/Windows to prevent recursive process spawning.
2. **Always** use context managers (`with Pool() as pool:`) for automatic cleanup.
3. **Return** data from workers; never mutate shared state across processes.
4. Use `pool.map` or `executor.map` when output order must match input order.
5. Write output files with `json.dump(result, f)` — no trailing newline issues.

## Pattern: Parallel File Checksums

```python
import hashlib
import json
import os
from multiprocessing import Pool

def compute_checksum(filepath):
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            sha256.update(chunk)
    return filepath, sha256.hexdigest()

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        results = pool.map(compute_checksum, files)
    checksums = dict(results)  # already sorted since files was sorted
    with open('checksums.json', 'w') as f:
        json.dump(checksums, f, indent=2)
```

## Pattern: Parallel Word Counting

**Important:** Split words with `f.read().split()` (whitespace splitting), not regex. This matches standard word tokenization for plain text files with space-separated words.

```python
import json
import os
from collections import Counter
from multiprocessing import Pool

def count_words(filepath):
    with open(filepath) as f:
        return Counter(f.read().split())

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.txt'))
    with Pool() as pool:
        counters = pool.map(count_words, files)
    total = Counter()
    for c in counters:
        total.update(c)
    with open('word_counts.json', 'w') as f:
        json.dump(dict(total), f)
```

## API Quick Reference

| API | Order preserved? |
|---|---|
| `pool.map(fn, items)` | Yes |
| `pool.starmap(fn, pairs)` | Yes |
| `ProcessPoolExecutor.map(fn, items)` | Yes |
| `as_completed(futures)` | No |

## When to Use What

- **CPU-bound** (checksums, computation): `multiprocessing.Pool` or `ProcessPoolExecutor`
- **I/O-bound** (network, files): `ThreadPoolExecutor` or `asyncio`
- **Simple parallel map**: `pool.map(fn, items)` — simplest and most reliable
