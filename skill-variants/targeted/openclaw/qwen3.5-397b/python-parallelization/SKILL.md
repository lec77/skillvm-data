---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing, concurrent.futures, or asyncio. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

IMPORTANT WORKFLOW:
1. Do NOT read input files first — write the Python script immediately.
2. Use `python3` to run the script (not `python`).
3. The script handles all file I/O internally — never read data files with tools.
4. Use simple string splitting (`f.read().split()`) for text processing — do NOT use regex or `.lower()`.
5. Only use `sort_keys=True` when the task explicitly asks for sorted keys. Do NOT use it for word count output.

## Pattern 1: Parallel File Checksums

Compute SHA-256 checksums for multiple binary files in parallel. Use `sort_keys=True` since checksum output should be sorted by filename.

```python
import hashlib
import json
import os
from multiprocessing import Pool

def checksum_file(path):
    with open(path, 'rb') as f:
        return path, hashlib.sha256(f.read()).hexdigest()

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        results = pool.map(checksum_file, files)
    with open('checksums.json', 'w') as f:
        json.dump(dict(results), f, sort_keys=True)
```

## Pattern 2: Parallel Word Frequency Count

Count word frequencies across multiple text files in parallel and merge results. Do NOT use `sort_keys=True` — write the dict as-is.

```python
import json
import os
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
        json.dump(dict(total), f)
```

## Key Rules

- Always use `if __name__ == '__main__':` guard
- Use `Pool()` with context manager (`with Pool() as pool:`)
- `pool.map(fn, items)` preserves input order
- Return data from workers; never use shared mutable state
- Only use `sort_keys=True` when the task asks for sorted keys (e.g., checksums). Do NOT use it for word count output.
- Read files inside worker functions — pass filenames, not file contents
- Use `'rb'` mode for binary files, default mode for text files
- Split text with `.split()` — do NOT use regex or `.lower()`
