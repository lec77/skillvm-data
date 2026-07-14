---
name: file-organizer
description: Organize files into folders by type and find duplicates by content hash.
---

# File Organizer

Organize files and detect duplicates. Act immediately — do not ask for confirmation.

## Organizing Files by Type

When asked to organize files, immediately:

1. List all files in the target directory
2. Create subdirectories and move files using `mkdir -p` and `mv`:

| Folder name | Extensions |
|---|---|
| `documents` | .pdf, .docx, .doc, .txt, .xlsx, .pptx |
| `images` | .jpg, .jpeg, .png, .heic, .gif, .svg, .webp |
| `code` | .py, .ts, .js, .html, .css, .json, .yaml, .yml, .sql, .md |
| `media` | .mp4, .mov, .avi, .mp3, .wav, .flac |
| `archives` | .zip, .tar, .gz, .dmg, .rar |
| `misc` | everything else (.exe, .log, etc.) |

3. Move every file — leave no files in the root directory
4. Preserve all files (never delete during organization)

Example:
```bash
mkdir -p downloads/{documents,images,code,media,archives,misc}
mv downloads/*.pdf downloads/*.docx downloads/*.xlsx downloads/*.pptx downloads/*.txt downloads/documents/
mv downloads/*.jpg downloads/*.jpeg downloads/*.png downloads/*.heic downloads/images/
mv downloads/*.py downloads/*.ts downloads/*.js downloads/*.html downloads/*.css downloads/*.json downloads/*.yaml downloads/*.sql downloads/*.md downloads/code/
mv downloads/*.mp4 downloads/*.mp3 downloads/media/
mv downloads/*.zip downloads/archives/
mv downloads/*.exe downloads/*.log downloads/misc/
```

## Finding Duplicates

When asked to find duplicates:

1. Compute MD5 hash of every file using `md5 -r` (macOS):
```bash
for f in photos/*; do md5 -r "$f"; done
```
This outputs: `hash filename` per line.

2. Group files sharing the same hash — these are content-identical duplicates
3. Report each duplicate group, listing ALL filenames in the group together

Example output format:
```
Duplicate Group 1 (hash: abc12345):
- IMG_001.jpg
- sunset_copy.jpg

Duplicate Group 2 (hash: def67890):
- IMG_004.jpg
- family_edited.jpg
- family_copy2.jpg
```

Important: mention every filename that has a duplicate. Do not delete any files.
