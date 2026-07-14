---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing, concurrent.futures, or asyncio. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

Guide to transforming sequential Python code into parallel implementations using multiprocessing, concurrent.futures, and asyncio.

## Decision Framework

| Workload Type | Best Choice | Why |
|---|---|---|
| CPU-bound (heavy computation) | `multiprocessing` | Bypasses the GIL; each process has its own interpreter |
| I/O-bound (files, network, DB) | `asyncio` or `threading` | Waiting on I/O doesn't need multiple cores |
| Mixed or uncertain | `concurrent.futures` | Unified API; swap `ProcessPoolExecutor` ↔ `ThreadPoolExecutor` |

## multiprocessing.Pool

```python
from multiprocessing import Pool

def process_item(item):
    # CPU-bound work here
    return result

# pool.map: parallel map — preserves ORDER of results
with Pool() as pool:                        # defaults to cpu_count() workers
    results = pool.map(process_item, items)

# pool.starmap: multiple arguments per call
def process_pair(a, b):
    return a + b

with Pool(processes=4) as pool:
    results = pool.starmap(process_pair, [(1, 2), (3, 4), (5, 6)])

# pool.apply_async: non-blocking, results NOT ordered
with Pool() as pool:
    futures = [pool.apply_async(process_item, (x,)) for x in items]
    results = [f.get() for f in futures]    # collect in submission order
```

## ProcessPoolExecutor (concurrent.futures)

```python
from concurrent.futures import ProcessPoolExecutor, as_completed

def worker(path):
    # do work, return result
    return result

# submit/as_completed pattern (results arrive as they finish — NOT ordered)
with ProcessPoolExecutor() as executor:
    futures = {executor.submit(worker, p): p for p in paths}
    for future in as_completed(futures):
        path = futures[future]
        result = future.result()            # raises if worker raised

# map pattern (preserves ORDER, lazy iterator)
with ProcessPoolExecutor(max_workers=8) as executor:
    results = list(executor.map(worker, paths))
```

## Loop-to-Map Transformation

```python
# BEFORE — sequential
results = []
for item in items:
    results.append(expensive(item))

# AFTER — parallel (pool.map)
from multiprocessing import Pool
with Pool() as pool:
    results = pool.map(expensive, items)
```

## Output Ordering

| API | Order preserved? |
|---|---|
| `pool.map` | Yes — same order as input |
| `pool.starmap` | Yes |
| `pool.apply_async` | No — results arrive as workers finish |
| `ProcessPoolExecutor.map` | Yes |
| `as_completed(futures)` | No — fastest first |

Use `pool.map` / `executor.map` when output order must match input order.

## Shared State: What to Avoid

Shared mutable state causes data corruption across processes. Each process has its own memory space — changes are not visible to siblings.

```python
# BAD — shared list, broken with multiprocessing
shared = []
def worker(x):
    shared.append(x)   # this mutates a COPY, not the original

# GOOD — return data, collect in parent
def worker(x):
    return x * 2

with Pool() as pool:
    results = pool.map(worker, items)   # parent collects all results
```

For shared counters/queues use `multiprocessing.Value`, `multiprocessing.Queue`, or `Manager`.

## Resource Management

```python
# Always use context managers — ensures pool.terminate() on exceptions
with Pool() as pool:
    results = pool.map(fn, items)
# pool.close() + pool.join() called automatically

# Manual cleanup (if context manager unavailable)
pool = Pool()
try:
    results = pool.map(fn, items)
finally:
    pool.close()    # no new tasks
    pool.join()     # wait for workers to finish
```

## Error Handling

```python
from multiprocessing import Pool

def risky_worker(item):
    if item < 0:
        raise ValueError(f"negative: {item}")
    return item ** 2

# Exceptions propagate through pool.map — re-raised in parent
with Pool() as pool:
    try:
        results = pool.map(risky_worker, items)
    except ValueError as e:
        print("worker failed:", e)

# With apply_async — exception raised on .get()
with Pool() as pool:
    futures = [pool.apply_async(risky_worker, (x,)) for x in items]
    results = []
    for f in futures:
        try:
            results.append(f.get())
        except Exception as e:
            results.append(None)    # or handle per-item
```

## Performance: chunk_size and Worker Count

```python
import os
from multiprocessing import Pool

# Optimal worker count for CPU-bound work
n_workers = os.cpu_count()          # or multiprocessing.cpu_count()

# chunk_size: batches items sent to each worker — reduces IPC overhead
# Rule of thumb: chunk_size = max(1, len(items) // (n_workers * 4))
with Pool(n_workers) as pool:
    results = pool.map(fn, items, chunksize=50)
```

Large `chunk_size` → less IPC overhead but worse load balancing.
Small `chunk_size` → better load balancing but higher IPC overhead.
For uniform-cost tasks: `chunksize = len(items) // (4 * n_workers)`.

## Common Patterns

### Batch File Processing

```python
import os
from multiprocessing import Pool

def process_file(path):
    with open(path) as f:
        data = f.read()
    return compute(data)

files = [f for f in os.listdir('.') if f.endswith('.txt')]
with Pool() as pool:
    results = pool.map(process_file, files)
```

### Merging Dicts from Workers

```python
from multiprocessing import Pool
from collections import Counter

def count_words(path):
    with open(path) as f:
        return Counter(f.read().split())

paths = [...]
with Pool() as pool:
    counters = pool.map(count_words, paths)

# Merge all counters in parent
total = Counter()
for c in counters:
    total.update(c)
```

### ProcessPoolExecutor with Result Collection

```python
from concurrent.futures import ProcessPoolExecutor
import hashlib

def checksum(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        h.update(f.read())
    return path, h.hexdigest()

with ProcessPoolExecutor() as executor:
    results = dict(executor.map(checksum, paths))
```

## Tips

- Use `if __name__ == '__main__':` guard on Windows/macOS to prevent recursive spawning.
- Avoid passing large objects between processes — prefer passing file paths or indices, and let each worker read its own data.
- `pool.map` is the simplest API; prefer it over `apply_async` unless you need non-blocking submission.
- For I/O-bound tasks, `ThreadPoolExecutor` avoids process spawn overhead and shares memory safely.
- Profile before parallelizing — overhead from process spawning can outweigh gains for very fast tasks.
