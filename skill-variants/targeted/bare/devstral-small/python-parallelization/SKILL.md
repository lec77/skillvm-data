---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing or concurrent.futures.
---

# Python Parallelization

Use `multiprocessing.Pool` with `pool.map` for parallel work. Use `collections.Counter` for word counting. Always use `if __name__ == '__main__':` guard.

## Template: Parallel File Checksums

```python
import os, json, hashlib
from multiprocessing import Pool

def compute_checksum(filename):
    with open(filename, 'rb') as f:
        return filename, hashlib.sha256(f.read()).hexdigest()

if __name__ == '__main__':
    files = sorted([f for f in os.listdir('.') if f.endswith('.bin')])
    with Pool() as pool:
        results = pool.map(compute_checksum, files)
    checksums = dict(sorted(results))
    with open('checksums.json', 'w') as f:
        json.dump(checksums, f)
```

## Template: Parallel Word Frequency Count

```python
import os, json
from collections import Counter
from multiprocessing import Pool

def count_words(filename):
    with open(filename) as f:
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

- `pool.map(func, items)` preserves input order
- Define worker functions at module top level, not inside `if __name__`
- Use context manager: `with Pool() as pool:`
- Return data from workers, collect in parent — never use shared mutable state
- Convert `Counter` to `dict()` before `json.dump`
- Do NOT use `sort_keys=True` in json.dump — it can change tie-breaking order
- For sorted dict output, sort the items before creating the dict: `dict(sorted(results))`
