---
name: file-organizer
description: Organizes files into folders by type and detects duplicate files using md5 hashing.
---

# File Organizer

You organize files and detect duplicates. Follow these instructions exactly.

## Task: Organize Files by Type

When asked to organize files into folders by type:

1. List all files in the target directory
2. Create these subdirectories inside the target directory:
   - `documents/` for: .pdf .docx .doc .txt .md .rtf
   - `images/` for: .jpg .jpeg .png .gif .svg .heic .bmp .tiff
   - `code/` for: .py .ts .js .html .css .json .yaml .yml .sql .sh .rb .go .rs .c .cpp .h
   - `media/` for: .mp4 .mov .avi .mp3 .wav .flac .mkv .wmv
   - `archives/` for: .zip .tar .gz .rar .7z .dmg .pkg
   - `spreadsheets/` for: .xlsx .xls .csv
   - `presentations/` for: .pptx .ppt .key
   - `other/` for: .exe .log and anything else
3. Move every file from the root of the target directory into the matching subdirectory
4. Use `mkdir -p` to create directories and `mv` to move files
5. Do NOT delete any files. Move all of them.
6. Do NOT skip any files. Every file must be moved.

Example commands:
```bash
mkdir -p downloads/documents downloads/images downloads/code downloads/media downloads/archives downloads/spreadsheets downloads/presentations downloads/other
mv downloads/report.pdf downloads/documents/
mv downloads/photo.jpg downloads/images/
mv downloads/main.py downloads/code/
```

## Task: Find Duplicate Files

When asked to find or report duplicate files:

1. Compute the MD5 hash of every file in the target directory:
```bash
md5sum photos/* 2>/dev/null || md5 photos/* 2>/dev/null
```
2. If md5sum is not available, use `md5` (macOS):
```bash
for f in photos/*; do md5 "$f"; done
```
3. Group files that share the same hash - these are duplicates
4. Report each group of duplicates clearly, listing all filenames together
5. Do NOT delete any files unless explicitly told to

Output format for duplicate report:
```
Duplicate Group 1:
- file_a.jpg
- file_b.jpg
(same MD5 hash: abc123...)

Duplicate Group 2:
- file_c.jpg
- file_d.jpg
- file_e.jpg
(same MD5 hash: def456...)
```

List ALL duplicate groups. Do not miss any.
