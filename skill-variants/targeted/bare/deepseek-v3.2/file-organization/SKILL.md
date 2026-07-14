---
name: file-organizer
description: Organize files into folders by type and find duplicates by comparing file contents.
---

# File Organizer

## Task: Organize Files by Type

When asked to organize files in a directory:

1. List all files: `ls -la <dir>`
2. Create category subdirectories inside the target directory:
   - `documents/` — .pdf, .docx, .doc, .txt, .pptx, .xlsx
   - `images/` — .jpg, .jpeg, .png, .heic, .gif, .svg, .webp
   - `code/` — .py, .ts, .js, .html, .css, .json, .yaml, .yml, .sql, .md
   - `media/` — .mp4, .mov, .avi, .mp3, .wav, .flac
   - `archives/` — .zip, .tar, .gz, .dmg, .rar
   - `other/` — .exe, .log, and anything else
3. Create all directories with `mkdir -p`
4. Move every file into its matching category folder using `mv`
5. Preserve all files — never delete any
6. After moving, run `find <dir> -type f` to verify all files are accounted for

## Task: Find Duplicate Files

When asked to find duplicates:

1. Compute a hash for every file: `md5sum <dir>/*` or `md5 <dir>/*`
2. Group files that share the same hash — these are exact duplicates
3. Report each duplicate group clearly, listing all filenames in the group
4. Do NOT delete any files unless explicitly told to

## Key Rules

- Always use shell commands (`ls`, `mkdir`, `mv`, `find`, `md5sum`/`md5`) to do the work
- Never delete files unless the user explicitly asks
- Work inside the target directory — create subdirectories there
- Move ALL files, leave nothing in the root of the target directory
