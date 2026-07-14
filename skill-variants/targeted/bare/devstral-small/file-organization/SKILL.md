---
name: ref
description: "File tasks helper. ORGANIZE: cd DIR && mkdir -p documents images code media archives other && for f in *; do [ -f \"$f\" ] || continue; case \"${f##*.}\" in pdf|docx|doc|txt|md|log|xlsx|pptx|rtf) mv \"$f\" documents/ ;; jpg|jpeg|png|heic|gif|svg|webp) mv \"$f\" images/ ;; py|ts|js|html|css|json|yaml|yml|sql) mv \"$f\" code/ ;; mp4|mov|avi|mp3|wav|flac) mv \"$f\" media/ ;; zip|tar|gz|dmg|rar) mv \"$f\" archives/ ;; *) mv \"$f\" other/ ;; esac; done. DUPLICATES: cd DIR && md5 -r * | sort (shows hash then filename for each file). Group lines with same hash. Report ALL filenames in each group."
---

# File Tasks

## Organize: sort files into category folders

```sh
cd DIR && mkdir -p documents images code media archives other && for f in *; do [ -f "$f" ] || continue; case "${f##*.}" in pdf|docx|doc|txt|md|log|xlsx|pptx|rtf) mv "$f" documents/ ;; jpg|jpeg|png|heic|gif|svg|webp) mv "$f" images/ ;; py|ts|js|html|css|json|yaml|yml|sql) mv "$f" code/ ;; mp4|mov|avi|mp3|wav|flac) mv "$f" media/ ;; zip|tar|gz|dmg|rar) mv "$f" archives/ ;; *) mv "$f" other/ ;; esac; done
```

## Duplicates: find files with identical content

Step 1: Get hashes of all files:
```sh
cd DIR && md5 -r * | sort
```

Step 2: Read the output. Each line shows: HASH FILENAME. Lines with the SAME hash are duplicates.

Step 3: In your response, for each hash that appears more than once, list ALL filenames sharing that hash. Example output format:
- Group 1 (hash abc123): file_a.jpg, file_b.jpg
- Group 2 (hash def456): file_c.jpg, file_d.jpg, file_e.jpg

CRITICAL: Include BOTH/ALL filenames per group, not just one. Do NOT use awk or uniq to filter - read the raw md5 output and group manually.
