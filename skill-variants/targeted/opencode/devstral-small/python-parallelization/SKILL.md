---
name: python-parallelization
description: Transform sequential Python into parallel code using multiprocessing. Use for CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

## Quick Reference

Use `multiprocessing.Pool` for CPU-bound work. Always use `if __name__ == '__main__':` guard.

## Pattern 1: Parallel File Processing with Checksums

```python
import os
import json
import hashlib
from multiprocessing import Pool

def compute_checksum(filename):
    """Return (filename, hex_digest) tuple."""
    h = hashlib.sha256()
    with open(filename, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return filename, h.hexdigest()

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        results = pool.map(compute_checksum, files)
    # sort_keys=True ensures JSON keys are alphabetically ordered
    with open('checksums.json', 'w') as f:
        json.dump(dict(results), f, indent=2, sort_keys=True)
```

Key points:
- `pool.map` preserves input order
- `sort_keys=True` in `json.dump` guarantees sorted output
- Return `(filename, value)` tuples, convert to dict in parent

## Pattern 2: Parallel Word Counting with Merge

```python
import os
import json
from collections import Counter
from multiprocessing import Pool

def count_words(filepath):
    """Count word frequencies in one file, return Counter."""
    with open(filepath) as f:
        return Counter(f.read().split())

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.txt'))
    with Pool() as pool:
        counters = pool.map(count_words, files)
    # Merge all Counters in parent process
    total = Counter()
    for c in counters:
        total.update(c)
    with open('word_counts.json', 'w') as f:
        json.dump(dict(total), f, indent=2)
```

Key points:
- Each worker returns a `Counter` — no shared state
- Merge with `Counter.update()` in parent
- `f.read().split()` splits on whitespace (handles newlines)

## Rules

1. **Always use `if __name__ == '__main__':` guard** — required on macOS/Windows to prevent recursive spawning
2. **Use `Pool()` with context manager** — ensures cleanup on exceptions
3. **`pool.map` preserves order** — use it when output order must match input
4. **No shared mutable state** — workers return data, parent collects
5. **Use `sort_keys=True`** in `json.dump` when sorted JSON keys are required
6. **Run the script after writing it** to produce the output file
