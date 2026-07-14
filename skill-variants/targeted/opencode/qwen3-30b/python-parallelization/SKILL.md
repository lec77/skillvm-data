---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing, concurrent.futures, or asyncio. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

## Quick Reference

| Workload | Use | Why |
|---|---|---|
| CPU-bound | `multiprocessing.Pool` | Bypasses GIL |
| I/O-bound | `threading` / `asyncio` | No need for multiple cores |
| Either | `concurrent.futures` | Unified API |

## Core Pattern: pool.map (Preserves Order)

```python
from multiprocessing import Pool

def worker(item):
    return process(item)  # return result, never mutate shared state

if __name__ == '__main__':
    with Pool() as pool:
        results = pool.map(worker, items)
```

**Rules:**
- Always use `if __name__ == '__main__':` guard (required on macOS)
- Always use context manager (`with Pool() as pool:`)
- Workers must RETURN data — shared mutable state is broken across processes
- `pool.map` preserves input order

## File Processing Pattern

```python
import os, json
from multiprocessing import Pool

def process_file(filename):
    with open(filename, 'rb') as f:
        data = f.read()
    result = compute(data)
    return filename, result  # return FILENAME (not path), result

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        results = dict(pool.map(process_file, files))
    with open('output.json', 'w') as f:
        json.dump(results, f, sort_keys=True, indent=2)
```

**Critical:** When output maps filenames to values, use bare filenames like `"data_00.bin"` as dict keys — never full paths like `"/tmp/xyz/data_00.bin"`. Use `os.path.basename(path)` if you receive full paths. Use `sort_keys=True` to ensure sorted JSON output.

## Checksum Pattern

```python
import hashlib, os, json
from multiprocessing import Pool

def compute_checksum(filename):
    h = hashlib.sha256()
    with open(filename, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return filename, h.hexdigest()

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        results = dict(pool.map(compute_checksum, files))
    with open('checksums.json', 'w') as f:
        json.dump(results, f, sort_keys=True, indent=2)
```

## Word Count / Dict Merge Pattern

```python
import os, json
from multiprocessing import Pool
from collections import Counter

def count_words_in_file(filename):
    with open(filename) as f:
        return Counter(f.read().split())

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.txt'))
    with Pool() as pool:
        counters = pool.map(count_words_in_file, files)
    total = Counter()
    for c in counters:
        total.update(c)
    with open('word_counts.json', 'w') as f:
        json.dump(dict(total), f, indent=2)
```

**Critical:** Use `Counter` + `.update()` to merge dicts from workers. Convert to `dict()` before JSON serialization.

## ProcessPoolExecutor Alternative

```python
from concurrent.futures import ProcessPoolExecutor

if __name__ == '__main__':
    with ProcessPoolExecutor() as executor:
        results = list(executor.map(worker, items))  # preserves order
```

## Common Mistakes

1. **Full paths as keys** — use `os.path.basename()` or `os.listdir()` (which returns bare names)
2. **Shared mutable state** — each process has its own memory; always return data from workers
3. **Missing `__main__` guard** — causes recursive spawning on macOS
4. **Unsorted output** — use `sort_keys=True` in `json.dump()` or sort the file list first
5. **Not using context manager** — always use `with Pool() as pool:` for proper cleanup
