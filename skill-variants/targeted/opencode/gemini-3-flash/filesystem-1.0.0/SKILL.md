---
name: filesystem
description: Filesystem operations — directory analysis, file search, batch rename. Use when analyzing directory trees, counting files, searching content, or batch-renaming files.
---

# Filesystem Operations

## Directory Analysis

To analyze a directory tree, gather these metrics:
- **Total files**: `find <dir> -type f | wc -l` (count all files recursively)
- **By extension**: `find <dir> -type f | sed 's/.*\./\./' | sort | uniq -c` (group by extension)
- **Largest file**: `find <dir> -type f -exec wc -c {} + | sort -n | tail` (most bytes = largest)
- **Content search**: `grep -rl "PATTERN" <dir>` (list files containing a string)
- **Max depth**: count directory levels from root (root=1, root/sub=2, root/sub/sub2=3, etc.)

When producing JSON output, use exact field names from the prompt. Write valid JSON with no trailing commas.

## Batch Rename to Kebab-Case

Kebab-case rules:
1. Lowercase everything
2. Replace spaces, underscores, parentheses `()`, brackets `[]`, and other non-alphanumeric characters with hyphens — **except dots (`.`) which must be preserved**
3. Collapse consecutive hyphens (`--` → `-`)
4. Remove leading/trailing hyphens from the name part (before the extension)
5. Keep the file extension unchanged

**Critical**: Dots within the filename stem (like `v3.1`) are NOT replaced with hyphens. Only the last dot separating name from extension is the extension separator.

Examples:
- `Report (Final).txt` → `report-final.txt`
- `CHANGELOG (v3.1).md` → `changelog-v3.1.md`  (dot in v3.1 preserved!)
- `data[v2].csv` → `data-v2.csv`
- `My Resume (Updated).pdf` → `my-resume-updated.pdf`
- `test_RESULTS_Final (1).json` → `test-results-final-1.json`
- `Budget   Forecast[2026].xlsx` → `budget-forecast-2026.xlsx`

Implementation approach:
```bash
# For each file, separate name and extension, then transform the name part only
for file in *; do
  ext="${file##*.}"
  name="${file%.*}"
  new_name=$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9.]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  new_file="${new_name}.${ext}"
  mv "$file" "$new_file"
done
```

When producing a rename log JSON, map each original filename to its new filename.
