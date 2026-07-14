---
name: filesystem
description: Filesystem operations for listing files, searching content, batch processing, and directory analysis. Use for directory listing, file search, batch rename/copy/move/delete, and size analysis.
---

# Filesystem Operations

## Directory Listing & Analysis

```bash
# List all files recursively
find . -type f

# Count files
find . -type f | wc -l

# Count by extension
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn

# Directory tree depth (find -printf %d is 0-based, add 1 if root counts as depth 1)
find . -type d -printf '%d\n' | sort -n | tail -1
# IMPORTANT: find -printf '%d' returns 0 for the start directory.
# If "project/" is depth 1, then max_depth = find_result + 1

# Find largest file by content size
find . -type f -exec wc -c {} + | sort -n | tail -2 | head -1

# Directory sizes
du -h --max-depth=1 . | sort -hr
```

## File Search

```bash
# By name pattern
find . -name "*.md" -type f

# By content (with filenames only)
grep -rl "keyword" .

# By content (with line numbers)
grep -rn "keyword" . --include="*.md"
```

## Batch Rename to Kebab-Case

When renaming files to kebab-case:

1. Split filename from extension using the LAST dot (e.g., `file.v2.txt` → name=`file.v2`, ext=`.txt`)
2. Lowercase the name part
3. Replace spaces, underscores, parentheses `()`, brackets `[]`, and other special characters with hyphens — but **preserve dots** within the name (dots are valid in kebab-case names like `v3.1`)
4. Collapse consecutive hyphens into one
5. Remove leading/trailing hyphens
6. Rejoin name + extension

**Correct regex for step 3:** replace `[^a-z0-9.]` with `-` (note: dot is preserved)

Example transformations:
- `Report (Final).txt` → `report-final.txt`
- `CHANGELOG (v3.1).md` → `changelog-v3.1.md`
- `data[v2].csv` → `data-v2.csv`
- `API_Response [raw].json` → `api-response-raw.json`

## Producing JSON Output

When asked to produce a JSON file with results:
- Use proper JSON with correct types (numbers as numbers, arrays as arrays)
- **File extensions must include the leading dot** (e.g., `".ts"`, `".json"`, `".md"` — NOT `"ts"`, `"json"`)
- Write directly — no need for intermediate scripts unless batch operations are complex
- For shell-based analysis, use `jq` or write a small script to collect data and output JSON

## Batch File Operations

```bash
# Copy by type
find . -name "*.md" -exec cp {} backup/ \;

# Move large files
find . -type f -size +1M -exec mv {} large/ \;

# Delete temp files
find . -name "*.tmp" -delete

# Delete empty directories
find . -type d -empty -delete
```
