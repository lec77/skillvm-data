---
name: python-parallelization
description: Transform sequential Python into parallel code using multiprocessing/concurrent.futures. Use for CPU-bound batch processing, file processing, checksums, word counts.
---

# Python Parallelization

## Quick Reference

**CPU-bound** → `multiprocessing.Pool` or `ProcessPoolExecutor`
**I/O-bound** → `ThreadPoolExecutor` or `asyncio`

## Core Patterns

### Pool.map (simplest, order-preserving)

```python
from multiprocessing import Pool
import os

def process_item(item):
    return result

if __name__ == '__main__':
    with Pool() as pool:
        results = pool.map(process_item, items)
```

### ProcessPoolExecutor.map (order-preserving)

```python
from concurrent.futures import ProcessPoolExecutor

def worker(path):
    return result

if __name__ == '__main__':
    with ProcessPoolExecutor() as executor:
        results = list(executor.map(worker, paths))
```

## File Checksum Pattern

```python
import hashlib
import json
import os
from multiprocessing import Pool

def compute_checksum(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        h.update(f.read())
    return os.path.basename(filepath), h.hexdigest()

if __name__ == '__main__':
    files = sorted([f for f in os.listdir('.') if f.endswith('.bin')])
    with Pool() as pool:
        pairs = pool.map(compute_checksum, files)
    result = dict(sorted(pairs, key=lambda x: x[0]))
    with open('checksums.json', 'w') as f:
        json.dump(result, f, indent=2)
```

## Word Count / Frequency Pattern

```python
import json
import os
from collections import Counter
from multiprocessing import Pool

def count_words(filepath):
    with open(filepath) as f:
        return Counter(f.read().split())

if __name__ == '__main__':
    files = sorted([f for f in os.listdir('.') if f.endswith('.txt')])
    with Pool() as pool:
        counters = pool.map(count_words, files)
    total = Counter()
    for c in counters:
        total.update(c)
    with open('word_counts.json', 'w') as f:
        json.dump(dict(total), f)
```

**Important:** Do NOT sort word count output keys alphabetically — just write `dict(total)` directly. Sorting changes iteration order which can affect downstream consumers.

## Key Rules

- Always use `if __name__ == '__main__':` guard (required on macOS/Windows)
- Use context managers (`with Pool()`) for automatic cleanup
- Return data from workers — never mutate shared state
- `pool.map` and `executor.map` preserve input order
- Use `os.path.basename(filepath)` to extract just the filename
- For checksum JSON: sort keys by filename using `dict(sorted(pairs))`
- For word count JSON: do NOT sort keys — write `dict(total)` as-is
