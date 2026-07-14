---
name: python-parallelization
description: Parallelize Python with multiprocessing. Use Pool for CPU-bound batch processing and Counter merging.
---

# Python Parallelization

Use `multiprocessing.Pool` with `pool.map` for parallel batch processing. Always use `if __name__ == '__main__':` guard.

## IMPORTANT: Writing and Running Scripts

If write_file fails, use execute_command with a heredoc to write the file:

```
cat > script.py << 'PYEOF'
...python code here...
PYEOF
```

Then run with: `python3 script.py`

You can also combine both in one command:

```
cat > script.py << 'PYEOF'
...python code here...
PYEOF
python3 script.py
```

## File Checksum Pattern

```python
import hashlib, json, os, glob
from multiprocessing import Pool

def compute_checksum(filepath):
    with open(filepath, 'rb') as f:
        return os.path.basename(filepath), hashlib.sha256(f.read()).hexdigest()

if __name__ == '__main__':
    files = sorted(glob.glob('*.bin'))
    with Pool() as pool:
        results = pool.map(compute_checksum, files)
    with open('checksums.json', 'w') as f:
        json.dump(dict(results), f, indent=2, sort_keys=True)
```

## Word Count Pattern

```python
import json, os
from collections import Counter
from multiprocessing import Pool

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

## Key Rules

- `pool.map` preserves input order
- Each worker returns data; parent collects results
- Never share mutable state between processes
- Use context manager (`with Pool()`) for cleanup
