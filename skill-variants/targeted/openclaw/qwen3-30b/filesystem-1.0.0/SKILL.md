---
name: filesystem
description: Filesystem operations for listing, searching, batch processing, and directory analysis. Use for batch rename, file search, directory analysis, and producing JSON output files.
---

# Filesystem Operations

IMPORTANT: When asked to analyze or operate on a directory, the directory ALREADY EXISTS with files in it. Do NOT create dummy/test files. Just analyze and process the existing files.

## NEVER use find -exec

The `find -exec` syntax does NOT work in this environment. ALWAYS use pipes instead:

```bash
# WRONG - will break:
find . -type f -exec wc -c {} \;

# CORRECT - use xargs:
find . -type f | xargs wc -c

# CORRECT - use while read:
find . -type f | while read f; do wc -c "$f"; done
```

## Writing JSON files

NEVER use the `write` tool to create JSON files. Use `exec` with `printf` or `cat` instead, because the `write` tool corrupts JSON content.

Example of writing JSON correctly:
```bash
printf '{\n  "key": "value",\n  "count": 42\n}\n' > output.json
```

Or with a variable:
```bash
cat > output.json << 'ENDJSON'
{
  "key": "value"
}
ENDJSON
```

## Batch Rename Files to Kebab-Case

Use a bash for-loop with tr and sed. Do NOT use `rename`. Work in-place.

### Complete procedure

```bash
cd target_dir
for f in *; do
  ext="${f##*.}"
  name="${f%.*}"
  new="$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9.]/-/g; s/--*/-/g; s/^-//; s/-$//')"
  newfile="${new}.${ext}"
  if [ "$f" != "$newfile" ]; then
    mv "$f" "$newfile"
  fi
done
```

Key rules:
- Separate extension from name BEFORE transforming
- Replace ALL non-alphanumeric chars (spaces, underscores, parentheses, brackets) with hyphens
- Dots inside the name are preserved (e.g., "v3.1" stays as "v3.1")
- Collapse consecutive hyphens into one
- Remove leading/trailing hyphens from name part
- Keep extension unchanged and lowercase it

### Producing rename_log.json

CRITICAL: You MUST build the rename log with ORIGINAL filenames mapped to NEW filenames. Do this in a single bash script that:
1. First saves the original names
2. Computes new names and writes the JSON
3. Then renames the files

```bash
cd target_dir

# Build rename_log.json with original->new mapping, then rename
exec 3> ../rename_log.json
printf '{\n' >&3
first=1
for f in *; do
  ext="${f##*.}"
  name="${f%.*}"
  new="$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9.]/-/g; s/--*/-/g; s/^-//; s/-$//')"
  newfile="${new}.${ext}"
  if [ $first -eq 1 ]; then first=0; else printf ',\n' >&3; fi
  printf '  "%s": "%s"' "$f" "$newfile" >&3
done
printf '\n}\n' >&3
exec 3>&-

# Now rename
for f in *; do
  ext="${f##*.}"
  name="${f%.*}"
  new="$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9.]/-/g; s/--*/-/g; s/^-//; s/-$//')"
  newfile="${new}.${ext}"
  if [ "$f" != "$newfile" ]; then
    mv "$f" "$newfile"
  fi
done
```

## Search and Analyze Directory Trees

IMPORTANT: The directory already exists with files. Do NOT create any files. Just analyze.

### Gathering data

Run these commands one at a time:

**1. Total files:**
```bash
find project/ -type f | wc -l
```

**2. Files by extension:**
```bash
find project/ -type f -name "*.*" | sed 's/.*\./\./' | sort | uniq -c
```

**3. Largest file by byte count:**
```bash
find project/ -type f | xargs wc -c | sort -rn | grep -v total | head -1
```

**4. Files containing a search term:**
```bash
grep -rl "TODO" project/ | xargs -I LINE basename LINE
```

**5. Max directory depth:**
```bash
find project/ -type d | awk -F/ '{print NF}' | sort -rn | head -1
```
(project/ = depth 1)

### Writing search_results.json

After collecting all values, use exec with printf to create the JSON file. Do NOT use the write tool.

```bash
printf '{\n  "total_files": %d,\n  "by_extension": {\n%s\n  },\n  "largest_file": "%s",\n  "files_containing_TODO": [%s],\n  "nested_depth": %d\n}\n' \
  "$total" "$ext_json" "$largest" "$todo_array" "$depth" > search_results.json
```

Or use cat with heredoc:
```bash
cat > search_results.json << ENDJSON
{
  "total_files": $total,
  "by_extension": {
    ".ts": 10,
    ".json": 4
  },
  "largest_file": "$largest",
  "files_containing_TODO": ["file1.ts", "file2.md"],
  "nested_depth": $depth
}
ENDJSON
```

## Critical Reminders

1. **NEVER use find -exec** — use `| xargs` or `| while read` instead
2. **NEVER use the write tool for JSON** — use exec with printf or cat heredoc
3. **Do NOT create test data** — analyze existing files only
4. **Build rename log BEFORE renaming** — save original names first
5. **Preserve dots in names** — "v3.1" stays as "v3.1", only non-alphanumeric except dots become hyphens
6. **Work in-place** — don't copy files to temp directories
