---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing, concurrent.futures, or asyncio. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

## Quick Decision

| Workload | Use | Why |
|---|---|---|
| CPU-bound | `multiprocessing.Pool` | Bypasses GIL |
| I/O-bound | `ThreadPoolExecutor` | No process spawn overhead |
| Either/unknown | `concurrent.futures` | Swap Pool↔Thread easily |

## Core Pattern: pool.map

```python
from multiprocessing import Pool

def process_item(item):
    # CPU-bound work
    return result

if __name__ == '__main__':  # REQUIRED on macOS — prevents recursive spawn
    with Pool() as pool:
        results = pool.map(process_item, items)  # preserves input ORDER
```

## Output Ordering

| API | Ordered? |
|---|---|
| `pool.map` / `pool.starmap` | Yes |
| `ProcessPoolExecutor.map` | Yes |
| `pool.apply_async` / `as_completed` | No |

**Use `pool.map` or `executor.map` when output order must match input.**

## File Processing with Correct Key Handling

**CRITICAL: When building a dict from file results, use `os.path.basename(path)` as the key — never the raw path argument, which may contain directory prefixes.**

### Checksum Pattern (returns filename→value pairs)

```python
import hashlib, json, os
from multiprocessing import Pool

def checksum_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return os.path.basename(path), h.hexdigest()  # basename as key!

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        pairs = pool.map(checksum_file, files)
    result = dict(sorted(pairs))  # sorted by filename
    with open('checksums.json', 'w') as f:
        json.dump(result, f, indent=2, sort_keys=True)
```

### Word Count Pattern (merge Counters from workers)

```python
import json, os
from collections import Counter
from multiprocessing import Pool

def count_words(path):
    with open(path) as f:
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

## JSON Output Rules

- Use `json.dump(data, f, indent=2)` for readable output
- Use `sort_keys=True` when output must be sorted by key
- Always write output inside `if __name__ == '__main__':` block
- Verify the output file exists after writing

## Loop-to-Map Transformation

```python
# BEFORE — sequential
results = []
for item in items:
    results.append(expensive(item))

# AFTER — parallel
from multiprocessing import Pool
if __name__ == '__main__':
    with Pool() as pool:
        results = pool.map(expensive, items)
```

## Shared State: Return, Don't Mutate

Each process has its own memory. Mutations to shared objects are invisible to siblings.

```python
# BAD — mutates a copy
shared = []
def worker(x):
    shared.append(x)  # broken with multiprocessing

# GOOD — return data, parent collects
def worker(x):
    return x * 2
with Pool() as pool:
    results = pool.map(worker, items)
```

## Key Rules

1. **Always guard with `if __name__ == '__main__':`** — macOS uses spawn, not fork
2. **Always use context managers** (`with Pool() as pool:`) for cleanup
3. **Return data from workers** — never mutate shared state
4. **Use basename for dict keys** when mapping filenames to results
5. **Prefer `pool.map`** — simplest API, preserves order
6. **Run the script** after writing it to produce the output file
