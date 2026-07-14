# File Organization

Organize files into clean directory structures and detect duplicates.

## Organizing Files by Type

When asked to organize a directory, move every file into a subdirectory based on its extension. Use these exact directory names:

| Directory | Extensions |
|-----------|-----------|
| `images` | .jpg .jpeg .png .gif .svg .heic .webp |
| `documents` | .pdf .docx .doc .txt .md .log |
| `code` | .py .ts .js .html .css .json .yaml .yml .sql |
| `media` | .mp4 .mov .avi .mp3 .wav .flac |
| `archives` | .zip .tar .gz .dmg |
| `spreadsheets` | .xlsx .csv |
| `presentations` | .pptx .key |
| `executables` | .exe .app .dmg |

Steps:
1. List all files in the target directory with `ls`
2. Create subdirectories: `mkdir -p images documents code media archives spreadsheets presentations executables`
3. Move each file to its category directory using `mv`
4. Leave NO files in the root directory — every file must be in a subdirectory
5. Preserve all files — do not delete anything

## Finding Duplicate Files

When asked to find duplicates:

1. Compute a hash for every file: `md5sum <file>` or `md5 <file>` (macOS)
2. Group files that share the same hash
3. Report each group clearly, listing ALL filenames in the group together

Example output format:
```
Duplicate Group 1:
- file_a.jpg
- file_b.jpg
(identical content, same hash)

Duplicate Group 2:
- photo1.jpg
- photo1_copy.jpg
- photo1_backup.jpg
(identical content, same hash)
```

Important: List every filename in each duplicate group. Do not skip any files.
