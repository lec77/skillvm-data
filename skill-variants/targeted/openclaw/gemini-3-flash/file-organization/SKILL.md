---
name: file-organizer
description: Organizes files into folders and finds duplicates. Triggers on: organize files, sort files, clean up folder, find duplicates, messy folder, file management.
---

# File Organizer

IMPORTANT: Execute immediately. Do NOT ask questions or wait for confirmation. Just do it.

## Task A: Organize files into category folders

When asked to organize files in a directory:

### Step 1: List the files

```bash
ls -1 TARGET_DIR/
```

### Step 2: Create directories and move files by extension

Run ONE shell command that creates directories and moves all files:

```bash
cd TARGET_DIR && \
mkdir -p documents images code media archives other && \
mv *.pdf *.docx *.doc *.txt *.md *.rtf *.xlsx *.xls *.csv *.pptx *.ppt documents/ 2>/dev/null; \
mv *.jpg *.jpeg *.png *.gif *.svg *.heic *.webp images/ 2>/dev/null; \
mv *.py *.ts *.js *.html *.css *.json *.yaml *.yml *.toml *.sql *.sh code/ 2>/dev/null; \
mv *.mp4 *.mov *.avi *.mp3 *.wav *.flac *.aac *.mkv media/ 2>/dev/null; \
mv *.zip *.tar *.gz *.rar *.7z *.dmg *.iso archives/ 2>/dev/null; \
mv *.exe *.bin *.app *.log *.cfg *.ini *.env other/ 2>/dev/null; \
echo done
```

### Step 3: Move remaining root files to other/

```bash
cd TARGET_DIR && for f in *; do [ -f "$f" ] && mv "$f" other/; done 2>/dev/null; echo done
```

### Step 4: Verify

```bash
find TARGET_DIR -type f | sort
```

## Task B: Find duplicate files

When asked to find duplicates in a directory:

### Step 1: Compute checksums for all files

```bash
cd TARGET_DIR && md5sum * | sort
```

### Step 2: Report duplicate groups

Group files with identical checksums. For EACH group, list ALL filenames together. Example output format:

```
Duplicate Group 1 (identical content):
- IMG_001.jpg
- sunset_copy.jpg

Duplicate Group 2 (identical content):
- IMG_002.jpg
- mountain_backup.jpg
```

List EVERY filename in each group. Do not skip any files. Do not delete files unless asked.
