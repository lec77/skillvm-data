---
name: file-organizer
description: Organize files into folders by type and find duplicate files using hashing.
---

# File Organizer

## Organizing Files by Type

When asked to organize files in a directory:

1. List all files: `ls -la <directory>`
2. Create category subdirectories inside the target directory:
   - `documents/` for .pdf, .docx, .doc, .txt, .md, .xlsx, .pptx
   - `images/` for .jpg, .jpeg, .png, .heic, .gif, .svg, .webp
   - `code/` for .py, .ts, .js, .html, .css, .json, .yaml, .yml, .sql
   - `media/` for .mp4, .mov, .avi, .mp3, .wav, .flac
   - `archives/` for .zip, .tar, .gz, .dmg
   - `other/` for anything else (.exe, .log, etc.)
3. Create directories: `mkdir -p <directory>/documents <directory>/images <directory>/code <directory>/media <directory>/archives <directory>/other`
4. Move each file to its category folder using `mv`. Move ALL files - leave no files in the root.
5. Verify: `find <directory> -type f | head -50`

IMPORTANT: Use exactly these directory names. Do NOT use names like "pics" or "src" - use "images" and "code".

## Finding Duplicate Files

When asked to find duplicates:

1. Compute MD5 hash of every file: `md5sum <directory>/*` (or `md5 <directory>/*` on macOS)
2. Group files that share the same hash - these are duplicates
3. Report each group of duplicates, listing ALL filenames in the group
4. Do NOT delete any files unless explicitly asked

Example output format:
```
Duplicate group 1: file_a.jpg, file_b.jpg (same content)
Duplicate group 2: file_c.jpg, file_d.jpg, file_e.jpg (same content)
```

IMPORTANT: Always mention every filename in each duplicate group in your response.
