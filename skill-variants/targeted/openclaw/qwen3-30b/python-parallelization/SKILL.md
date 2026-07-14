---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing, concurrent.futures, or asyncio. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

IMPORTANT WORKFLOW:
1. Do NOT read the input files first. Write the Python script immediately.
2. Use `python3` to run the script (not `python`).
3. The script handles file I/O internally — never read data files with tools.

## Pattern 1: Parallel File Checksums

Compute SHA-256 checksums for multiple files in parallel and write sorted JSON output.

```python
import hashlib
import json
import os
from multiprocessing import Pool

def checksum_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        h.update(f.read())
    return path, h.hexdigest()

if __name__ == '__main__':
    files = sorted([f for f in os.listdir('.') if f.endswith('.bin')])
    with Pool() as pool:
        results = pool.map(checksum_file, files)
    # sort_keys ensures JSON keys are in alphabetical order
    with open('checksums.json', 'w') as f:
        json.dump(dict(results), f, sort_keys=True)
```

## Pattern 2: Parallel Word Frequency Count

Count word frequencies across multiple text files in parallel and merge results.

```python
import json
import os
from collections import Counter
from multiprocessing import Pool

def count_words(path):
    with open(path) as f:
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

## Key Rules

- Always use `if __name__ == '__main__':` guard
- Use `Pool()` with context manager (`with Pool() as pool:`)
- `pool.map(fn, items)` preserves input order — use for ordered results
- Return data from workers; never use shared mutable state
- Use `sort_keys=True` in `json.dump()` when sorted output is needed
- Read files inside worker functions, not before parallelization
- Use `'rb'` mode for binary files, `'r'` mode for text files
