---
name: file-organizer
description: Organizes files into folders by type, finds duplicates via MD5 hashing, and automates cleanup.
---

# File Organizer

Organize files and detect duplicates. Act immediately — do not ask clarifying questions.

## File Organization

1. List all files in the target directory
2. Create subdirectories by file type and move files:

| Directory | Extensions |
|-----------|-----------|
| documents | .pdf, .docx, .doc, .txt, .rtf |
| images | .jpg, .jpeg, .png, .gif, .heic, .svg, .bmp |
| code | .py, .ts, .js, .html, .css, .json, .yaml, .yml, .md, .sql |
| media | .mp4, .mp3, .mov, .avi, .wav, .flac |
| archives | .zip, .tar, .gz, .rar, .7z, .dmg |
| spreadsheets | .xlsx, .csv, .xls |
| presentations | .pptx, .ppt, .key |
| other | .exe, .log, anything else |

3. Use `mkdir -p` to create directories, then `mv` to move each file
4. Preserve all files — do not delete anything during organization

## Duplicate Detection

To find duplicate files:

```bash
# Compute MD5 hash for every file in the directory
find [directory] -type f -exec md5sum {} \;
```

If `md5sum` is not available (macOS), use:
```bash
find [directory] -type f -exec md5 {} \;
```

Group files with identical hashes. Report each duplicate group listing all filenames. Do NOT delete any files — only report findings.
