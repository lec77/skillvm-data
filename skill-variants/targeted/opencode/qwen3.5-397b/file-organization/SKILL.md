---
name: file-organizer
description: Organize files into folders by type, find duplicates, and clean up messy directories.
---

# File Organizer

## CRITICAL: Act immediately. Do NOT ask for confirmation. Execute all file operations directly.

## Task: Organize Files by Type

When asked to organize files in a directory:

1. List all files with `ls` or `find`
2. Create category subdirectories inside the target directory
3. Move every file into the correct subdirectory using `mv`
4. Verify no files remain at the root level

### Required directory names and file mappings

Use these EXACT directory names:

| Directory | Extensions |
|-----------|-----------|
| `images` | .jpg, .jpeg, .png, .gif, .svg, .heic, .bmp, .webp |
| `documents` | .pdf, .docx, .doc, .txt, .rtf, .odt, .pptx, .xlsx |
| `code` | .py, .ts, .js, .html, .css, .json, .yaml, .yml, .sql, .md, .sh |
| `media` | .mp4, .mp3, .mov, .avi, .wav, .flac, .mkv |
| `archives` | .zip, .tar, .gz, .rar, .7z, .dmg |
| `misc` | .exe, .log, everything else |

### Execution pattern

```bash
# Create all directories at once
mkdir -p downloads/images downloads/documents downloads/code downloads/media downloads/archives downloads/misc

# Move files by extension
mv downloads/*.jpg downloads/*.jpeg downloads/*.png downloads/*.heic downloads/images/ 2>/dev/null
mv downloads/*.pdf downloads/*.docx downloads/*.txt downloads/*.pptx downloads/*.xlsx downloads/documents/ 2>/dev/null
mv downloads/*.py downloads/*.ts downloads/*.js downloads/*.html downloads/*.css downloads/*.json downloads/*.yaml downloads/*.sql downloads/*.md downloads/code/ 2>/dev/null
mv downloads/*.mp4 downloads/*.mp3 downloads/media/ 2>/dev/null
mv downloads/*.zip downloads/archives/ 2>/dev/null
mv downloads/*.exe downloads/*.log downloads/misc/ 2>/dev/null
```

Handle filenames with spaces using quotes: `mv "downloads/Document (1).pdf" downloads/documents/`

## Task: Find Duplicates

When asked to find duplicate files:

1. Compute checksums of all files: `md5sum photos/*` or `md5 photos/*`
2. Group files with identical checksums
3. Report each group listing all filenames together
4. Do NOT delete any files unless explicitly asked

Output format:
```
Duplicate Group 1:
- file_a.jpg
- file_b.jpg

Duplicate Group 2:
- file_c.jpg
- file_d.jpg
- file_e.jpg
```
