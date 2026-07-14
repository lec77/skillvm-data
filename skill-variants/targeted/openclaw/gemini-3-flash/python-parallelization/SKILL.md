---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing, concurrent.futures, or asyncio. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

## CRITICAL: Working with Existing Files

**NEVER create, generate, or overwrite input data files.** The input files already exist in the working directory. Always list existing files first (`ls`) to confirm they are present before writing your script. Your script must read and process the files that are already there.

## Quick Reference

### multiprocessing.Pool (preferred for simplicity)

```python
from multiprocessing import Pool
import json

def process_item(filename):
    # Read and process the EXISTING file
    with open(filename, 'rb') as f:
        data = f.read()
    # ... compute result ...
    return filename, result

if __name__ == '__main__':
    import os
    # List EXISTING files - do NOT create them
    files = sorted([f for f in os.listdir('.') if f.endswith('.bin')])

    with Pool() as pool:
        results = pool.map(process_item, files)

    # Write output
    output = dict(sorted(results))
    with open('output.json', 'w') as f:
        json.dump(output, f, indent=2)
```

### Word Counting with Counter Merge

```python
from multiprocessing import Pool
from collections import Counter
import json

def count_words(filepath):
    with open(filepath, 'r') as f:
        return Counter(f.read().split())

if __name__ == '__main__':
    import os
    files = sorted([f for f in os.listdir('.') if f.endswith('.txt')])

    with Pool() as pool:
        counters = pool.map(count_words, files)

    total = Counter()
    for c in counters:
        total.update(c)

    with open('word_counts.json', 'w') as f:
        json.dump(dict(total), f, indent=2)
```

### SHA-256 Checksums in Parallel

```python
from multiprocessing import Pool
import hashlib, json, os

def checksum(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        h.update(f.read())
    return path, h.hexdigest()

if __name__ == '__main__':
    files = sorted([f for f in os.listdir('.') if f.endswith('.bin')])
    with Pool() as pool:
        results = pool.map(checksum, files)
    with open('checksums.json', 'w') as f:
        json.dump(dict(results), f, indent=2)
```

## Key Rules

| Rule | Details |
|---|---|
| Use existing files | NEVER create or overwrite input files - they already exist |
| Use `pool.map` | Simplest API, preserves order |
| Context managers | Always `with Pool() as pool:` |
| `__main__` guard | Always use `if __name__ == '__main__':` |
| Return from workers | Workers return data; parent collects results |
| Sort output | Use `sorted()` when output order matters |
