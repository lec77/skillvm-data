---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing, concurrent.futures, or asyncio. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

## Quick Reference

**CPU-bound** → `multiprocessing.Pool` or `ProcessPoolExecutor`
**I/O-bound** → `ThreadPoolExecutor` or `asyncio`

## CRITICAL: macOS/Windows Guard

Every parallel script MUST have `if __name__ == '__main__':` guard to prevent recursive spawning on macOS (which uses `spawn` start method). Without this guard, the script will hang or crash.

## Pattern 1: Parallel File Checksums

```python
import os, json, hashlib
from multiprocessing import Pool

def compute_checksum(filename):
    """Process a single file. Takes FILENAME (not path). Returns (filename, hex_digest)."""
    with open(filename, 'rb') as f:
        return filename, hashlib.sha256(f.read()).hexdigest()

if __name__ == '__main__':
    # Use just filenames (e.g. "data_00.bin"), NOT full paths
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        results = pool.map(compute_checksum, files)
    # Build dict with BARE filenames as keys
    checksums = {fname: digest for fname, digest in results}
    with open('checksums.json', 'w') as f:
        json.dump(checksums, f, indent=2, sort_keys=True)
```

**Output format**: `{"data_00.bin": "abc123...", "data_01.bin": "def456...", ...}` — keys are bare filenames sorted alphabetically, values are lowercase hex SHA-256 digests. Use `sort_keys=True` in json.dump.

## Pattern 2: Parallel Word Counting with Counter Merge

```python
import os, json
from multiprocessing import Pool
from collections import Counter

def count_words_in_file(filename):
    """Count words in one file. Returns a Counter."""
    with open(filename) as f:
        return Counter(f.read().split())

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.txt'))
    with Pool() as pool:
        counters = pool.map(count_words_in_file, files)
    total = Counter()
    for c in counters:
        total.update(c)
    # Sort by key for deterministic output
    with open('word_counts.json', 'w') as f:
        json.dump(dict(sorted(total.items())), f, indent=2)
```

**Output format**: `{"word": count, ...}` — keys are words (strings) sorted alphabetically, values are integer counts. All words from all files merged into one frequency dict. Always sort keys for deterministic output.

## Pattern 3: ProcessPoolExecutor Alternative

```python
from concurrent.futures import ProcessPoolExecutor
import os, json

def worker(filename):
    return filename, result

if __name__ == '__main__':
    files = sorted(os.listdir('.'))
    with ProcessPoolExecutor() as executor:
        results = dict(executor.map(worker, files))
    with open('output.json', 'w') as f:
        json.dump(results, f, sort_keys=True)
```

## Output Ordering

| API | Order preserved? |
|---|---|
| `pool.map` / `pool.starmap` | Yes |
| `ProcessPoolExecutor.map` | Yes |
| `pool.apply_async` / `as_completed` | No |

## Common Mistakes

1. **Missing `if __name__ == '__main__':` guard** → infinite process spawning on macOS
2. **Using full paths as dict keys** → use bare filenames like `data_00.bin`, not `/path/to/data_00.bin`
3. **Mutating shared state in workers** → each process has separate memory; return data instead
4. **Not sorting output** → use `sort_keys=True` in `json.dump`
5. **Forgetting to run the script** → always execute with `python3 script.py` after writing
