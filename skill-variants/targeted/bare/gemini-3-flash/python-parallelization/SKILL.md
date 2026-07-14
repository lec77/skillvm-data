---
name: python-parallelization
description: Transform sequential Python into parallel implementations using multiprocessing or concurrent.futures for batch file processing.
---

# Python Parallelization

## Quick Reference

Use `multiprocessing.Pool` with `pool.map` for CPU-bound parallel work. Always use `if __name__ == '__main__':` guard.

## Core Pattern: pool.map

```python
import glob
import json
from multiprocessing import Pool

def process_file(filepath):
    """Worker function — receives one filepath, returns (filename, result)."""
    with open(filepath, 'rb') as f:
        data = f.read()
    # ... compute on data ...
    return filepath, result

if __name__ == '__main__':
    # Enumerate files with sorted glob for deterministic ordering
    files = sorted(glob.glob('data_*.bin'))

    with Pool() as pool:
        results = pool.map(process_file, files)

    # Build dict from (key, value) tuples, write sorted JSON
    output = dict(sorted(results, key=lambda x: x[0]))
    with open('output.json', 'w') as f:
        json.dump(output, f, indent=2)
```

**Key points:**
- `pool.map` preserves input order and returns all results as a list
- Worker functions must be defined at module top level (not nested)
- Return `(filename, result)` tuples from workers, then `dict()` to build mapping
- Use `sorted(glob.glob(...))` to enumerate files in deterministic order
- Always use context manager (`with Pool()`) for cleanup

## Word Frequency with Counter Merging

```python
from multiprocessing import Pool
from collections import Counter
import glob, json

def count_words(path):
    with open(path) as f:
        return Counter(f.read().split())

if __name__ == '__main__':
    files = sorted(glob.glob('*.txt'))
    with Pool() as pool:
        counters = pool.map(count_words, files)

    total = Counter()
    for c in counters:
        total.update(c)

    with open('word_counts.json', 'w') as f:
        json.dump(dict(total), f, indent=2)
```

## SHA-256 Checksums in Parallel

```python
from multiprocessing import Pool
import hashlib, glob, json

def compute_checksum(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return filepath, h.hexdigest()

if __name__ == '__main__':
    files = sorted(glob.glob('data_*.bin'))
    with Pool() as pool:
        results = pool.map(compute_checksum, files)

    checksums = dict(results)  # already sorted since files were sorted
    with open('checksums.json', 'w') as f:
        json.dump(checksums, f, indent=2)
```

## Rules

1. **Always use `if __name__ == '__main__':` guard** — required on macOS/Windows to prevent recursive spawning
2. **Use `sorted(glob.glob(...))` for file discovery** — ensures deterministic, sorted file lists
3. **Return data from workers, collect in parent** — never use shared mutable state across processes
4. **Use context managers** (`with Pool()`) — ensures proper cleanup
5. **Run the script after writing it** — verify output is correct
