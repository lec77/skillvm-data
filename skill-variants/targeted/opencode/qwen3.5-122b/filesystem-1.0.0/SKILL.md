---
name: filesystem
description: Filesystem operations for listing, searching, batch processing, and analysis. Use for directory listing, file search by name/content, batch rename/copy/move/delete, directory structure analysis, and file size analysis.
---

# Filesystem Operations

## Directory Analysis

### Count files recursively
```bash
find <dir> -type f | wc -l
```

### Count files by extension
```bash
find <dir> -type f | sed 's/.*\./\./' | sort | uniq -c
```
Files without extensions (like `.gitignore`): these have no `.ext` — count them separately or note they lack a standard extension. Only count the part after the LAST dot as the extension.

### Find largest file by content size
```bash
find <dir> -type f -exec wc -c {} + | sort -n | tail -5
```
Use `wc -c` (byte count) to measure content size, NOT `ls -l` (which includes metadata).

### Calculate maximum directory nesting depth
The depth is the number of path components from the root directory to the deepest subdirectory.
- `project/` = depth 1
- `project/src/` = depth 2
- `project/src/utils/` = depth 3
- `project/src/utils/helpers/` = depth 4

IMPORTANT: You must calculate depth RELATIVE to the target directory, not using absolute paths.
Do NOT use `awk -F/ '{print NF}'` on absolute paths — it counts all path components including `/var/folders/...`.

Correct approach — use `cd` first, then compute from relative paths:
```bash
cd <dir> && find . -type d | awk -F/ '{print NF}' | sort -n | tail -1
```
This works because `find .` outputs relative paths like `./src/utils/helpers` where NF correctly counts depth.

Alternative: subtract the base depth:
```bash
base=$(echo "<dir>" | awk -F/ '{print NF}')
find <dir> -type d | awk -F/ -v base="$base" '{print NF - base + 1}' | sort -n | tail -1
```

IMPORTANT: The depth is about DIRECTORIES, not files. Count the deepest directory path from the root.

## File Search

### Search by name
```bash
find <dir> -name "*.ts" -type f
find <dir> -iname "*pattern*"   # case-insensitive
```

### Search by content
```bash
grep -rl "TODO" <dir>           # list files containing "TODO"
grep -rn "pattern" <dir>        # show line numbers
grep -r "pattern" <dir> --include="*.ts"  # filter by type
```
To get just filenames from grep results: `grep -rl "TEXT" <dir> | xargs -n1 basename`

## Batch Rename to Kebab-Case

Kebab-case rules:
1. Convert ALL characters to lowercase
2. Replace spaces, underscores `_`, parentheses `()`, square brackets `[]`, and other special chars with hyphens `-`
3. Collapse multiple consecutive hyphens into a single hyphen
4. Remove leading and trailing hyphens from the filename (before the extension)
5. Preserve the file extension exactly (including the dot)
6. Periods that are part of version numbers (like `v3.1`) should be PRESERVED, not replaced

### Examples
| Original | Kebab-case |
|----------|-----------|
| `Report (Final).txt` | `report-final.txt` |
| `meeting_NOTES 2026.md` | `meeting-notes-2026.md` |
| `data[v2].csv` | `data-v2.csv` |
| `My Resume (Updated).pdf` | `my-resume-updated.pdf` |
| `PROJECT  Plan.docx` | `project-plan.docx` |
| `test_RESULTS_Final (1).json` | `test-results-final-1.json` |
| `Budget   Forecast[2026].xlsx` | `budget-forecast-2026.xlsx` |
| `CHANGELOG (v3.1).md` | `changelog-v3.1.md` |
| `Photo (vacation) BEACH.jpg` | `photo-vacation-beach.jpg` |
| `API_Response [raw].json` | `api-response-raw.json` |

### Implementation approach
For each file:
1. Separate the extension from the basename
2. Lowercase the basename
3. Replace `_`, `(`, `)`, `[`, `]`, spaces with `-`
4. Collapse consecutive `-` into one
5. Strip leading/trailing `-`
6. Re-attach the extension
7. Rename with `mv`

```bash
for f in *; do
  ext="${f##*.}"
  base="${f%.*}"
  new=$(echo "$base" | tr '[:upper:]' '[:lower:]' | sed 's/[_()[\] ]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  [ "$f" != "$new.$ext" ] && mv "$f" "$new.$ext"
done
```

After renaming, create a JSON log mapping original → new filenames.

## Batch Operations

### Bulk copy
```bash
find . -name "*.md" -exec cp {} backup/ \;
```

### Bulk move
```bash
find . -name "*.log" -exec mv {} logs/ \;
```

### Bulk delete
```bash
find . -name "*.tmp" -delete
find . -type d -empty -delete
```

## Output Formats

When producing JSON output:
- Use proper JSON format with correct types (numbers as numbers, arrays as arrays)
- Validate JSON is parseable before writing
- Use `jq` or manual construction to build valid JSON
