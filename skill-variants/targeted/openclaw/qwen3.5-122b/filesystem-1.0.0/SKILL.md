---
name: filesystem
description: Advanced filesystem operations for listing files, searching content, batch processing, and directory analysis.
---

# Filesystem Operations

## Batch Rename

When renaming files to a normalized format (e.g., kebab-case):

1. List files first with `ls` to see what needs renaming
2. Process each file carefully, separating the base name from the extension
3. **CRITICAL**: Preserve dots within the base name (e.g., "v3.1" stays as "v3.1"). Only the LAST dot separates the extension. Dots that are part of version numbers or other meaningful parts of the filename must NOT be replaced with hyphens.
4. Replace only these characters with hyphens: spaces, underscores, parentheses `()`, brackets `[]`, and other non-alphanumeric-non-dot characters
5. Collapse consecutive hyphens into one, remove leading/trailing hyphens

**Recommended bash pattern for kebab-case rename:**
```bash
cd target_dir
for f in *; do
  # Split on LAST dot only to get base and extension
  if [[ "$f" == *.* ]]; then
    ext="${f##*.}"
    base="${f%.*}"
  else
    ext=""
    base="$f"
  fi

  # Lowercase the base, replace special chars (NOT dots) with hyphens
  new_base=$(echo "$base" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9.]/-/g' | sed 's/-\+/-/g' | sed 's/^-//;s/-$//')

  if [ -n "$ext" ]; then
    new_name="${new_base}.${ext}"
  else
    new_name="$new_base"
  fi

  if [ "$f" != "$new_name" ]; then
    mv -- "$f" "$new_name"
  fi
done
```

After renaming, always produce a JSON log mapping original filenames to new filenames.

## Directory Analysis

When analyzing a directory tree:

1. **Count all files recursively**: `find dir -type f | wc -l`
2. **Count by extension**: `find dir -type f | sed 's/.*\./\./' | sort | uniq -c`
   - Files without extensions (like `.gitignore`) need special handling
3. **Find largest file by content size**: `find dir -type f -exec wc -c {} + | sort -n | tail`
   - Report just the filename, not the full path
4. **Search file contents**: `grep -rl "pattern" dir`
   - Report just filenames, not paths
5. **Max directory depth**: Count the deepest level of nesting
   - The root directory itself is depth 1, its direct subdirectories are depth 2, etc.
   - Use: `find dir -type d | awk -F'/' '{print NF}' | sort -n | tail -1`
   - This works because `find dir -type d` outputs paths like `project/src/utils/helpers` which has 4 slash-separated components = depth 4

Always output results as a JSON file with clearly named fields.

## Key Commands

| Task | Command |
|------|---------|
| List files | `ls -la`, `find . -type f` |
| Search by name | `find . -name "*.ext"` |
| Search content | `grep -rn "pattern" .` |
| File sizes | `du -sh`, `wc -c` |
| Directory tree | `find . -type d`, `tree` |
