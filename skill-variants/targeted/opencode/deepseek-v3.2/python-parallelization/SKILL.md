---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing or concurrent.futures. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

## Quick Start: multiprocessing.Pool

```python
import json
import os
from multiprocessing import Pool

def process_item(item):
    # work here
    return result

if __name__ == '__main__':
    items = [...]
    with Pool() as pool:
        results = pool.map(process_item, items)
```

**CRITICAL**: Always wrap pool usage in `if __name__ == '__main__':` to prevent recursive spawning on macOS/Windows.

## Pattern 1: Batch File Checksums

```python
import hashlib
import json
import os
from multiprocessing import Pool

def compute_checksum(filepath):
    with open(filepath, 'rb') as f:
        return os.path.basename(filepath), hashlib.sha256(f.read()).hexdigest()

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        pairs = pool.map(compute_checksum, files)
    result = dict(sorted(pairs))
    with open('checksums.json', 'w') as f:
        json.dump(result, f, indent=2)
```

## Pattern 2: Word Frequency Count

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
        json.dump(dict(total), f, indent=2)
```

## concurrent.futures Alternative

```python
from concurrent.futures import ProcessPoolExecutor
import hashlib, json, os

def worker(path):
    with open(path, 'rb') as f:
        return os.path.basename(path), hashlib.sha256(f.read()).hexdigest()

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with ProcessPoolExecutor() as executor:
        results = dict(executor.map(worker, files))
    with open('output.json', 'w') as f:
        json.dump(dict(sorted(results.items())), f, indent=2)
```

## Key Rules

| Rule | Details |
|---|---|
| Always use `if __name__ == '__main__':` | Required on macOS/Windows to prevent fork bomb |
| Use context managers | `with Pool() as pool:` ensures cleanup |
| `pool.map` preserves order | Results match input order |
| Return data from workers | Never mutate shared state |
| Use `f.read().split()` for words | Simple whitespace splitting |
| Use `f.read()` then hash for checksums | Read entire file as bytes |
| Write JSON with `json.dump` | Use `indent=2` for readability |
| Sort keys only when asked | Only sort if the task requires sorted output |

## Decision Guide

- **CPU-bound** (hashing, computation): `multiprocessing.Pool` or `ProcessPoolExecutor`
- **I/O-bound** (network, DB): `ThreadPoolExecutor` or `asyncio`
- **Default choice**: `multiprocessing.Pool` with `pool.map` — simplest API

## After Writing the Script

Always run the script immediately with `python3 script_name.py` to verify it produces the expected output file.
