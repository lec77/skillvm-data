---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing, concurrent.futures, or asyncio. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

Transform sequential Python into parallel code. Be concise: write the script, run it, report results. Do not write verification scripts or alternative implementations.

## When to Use What

- **CPU-bound** (hashing, math): `multiprocessing.Pool` or `ProcessPoolExecutor`
- **I/O-bound** (files, network): `asyncio` or `ThreadPoolExecutor`

## Pattern 1: Parallel File Processing with Pool.map

```python
import os, json, hashlib
from multiprocessing import Pool

def process_file(filepath):
    with open(filepath, 'rb') as f:
        return os.path.basename(filepath), hashlib.sha256(f.read()).hexdigest()

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        results = pool.map(process_file, files)
    output = dict(sorted(results))
    with open('output.json', 'w') as f:
        json.dump(output, f, indent=2)
```

Key points:
- `pool.map` preserves input order
- Always use `if __name__ == '__main__':` guard
- Use context manager (`with Pool()`)
- Return data from workers, collect in parent

## Pattern 2: Parallel Word Counting with Counter Merge

```python
import os, json
from multiprocessing import Pool
from collections import Counter

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

Key points:
- Each worker returns a Counter dict
- Merge counters in parent process using `total.update(c)`
- Never use shared mutable state across processes

## Common Mistakes to Avoid

- Missing `if __name__ == '__main__':` causes recursive spawn on macOS
- Mutating shared state across processes (each process has own memory)
- Passing large objects between processes (pass file paths instead)
