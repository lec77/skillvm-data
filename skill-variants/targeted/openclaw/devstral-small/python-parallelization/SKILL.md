---
name: python-parallelization
description: Transform sequential Python into parallel code using multiprocessing.Pool. Use for batch file processing, checksums, word counting.
---

# Python Parallelization with multiprocessing

Use `multiprocessing.Pool` with `pool.map` for parallel file processing. Always use `if __name__ == '__main__':` guard.

## Template: Parallel File Checksum

```python
import hashlib
import json
import os
from multiprocessing import Pool

def compute_checksum(filename):
    with open(filename, 'rb') as f:
        return filename, hashlib.sha256(f.read()).hexdigest()

if __name__ == '__main__':
    files = sorted([f for f in os.listdir('.') if f.endswith('.bin')])
    with Pool() as pool:
        results = pool.map(compute_checksum, files)
    output = dict(sorted(results))
    with open('checksums.json', 'w') as f:
        json.dump(output, f, indent=2)
```

## Template: Parallel Word Count

```python
import json
import os
from collections import Counter
from multiprocessing import Pool

def count_words(filename):
    with open(filename) as f:
        return dict(Counter(f.read().split()))

if __name__ == '__main__':
    files = sorted([f for f in os.listdir('.') if f.endswith('.txt')])
    with Pool() as pool:
        results = pool.map(count_words, files)
    total = Counter()
    for r in results:
        total.update(r)
    with open('word_counts.json', 'w') as f:
        json.dump(dict(total), f, indent=2)
```

## Key Rules

- Always wrap main code in `if __name__ == '__main__':` guard
- Use `pool.map(worker_fn, items)` — preserves input order
- Return data from workers, merge in parent process
- Convert Counter to `dict()` before `json.dump()`
- Use `dict(sorted(results))` when output must be sorted by key
- Always use context manager: `with Pool() as pool:`
- Run the script after writing it
