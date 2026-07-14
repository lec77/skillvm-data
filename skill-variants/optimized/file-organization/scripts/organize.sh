#!/bin/bash
# Organize files in a directory by type
# Usage: bash scripts/organize.sh <directory>
# Example: bash scripts/organize.sh downloads

DIR="$1"

if [ -z "$DIR" ]; then
  echo "Usage: bash organize.sh <directory>"
  exit 1
fi

if [ ! -d "$DIR" ]; then
  echo "Error: Directory '$DIR' not found"
  exit 1
fi

echo "=== Organizing files in $DIR ==="

# Create category directories
mkdir -p "$DIR/documents" "$DIR/images" "$DIR/code" "$DIR/media" "$DIR/archives" "$DIR/other"

# Documents
for ext in pdf docx doc txt md rtf odt xlsx xls csv pptx ppt; do
  for f in "$DIR"/*.$ext; do [ -f "$f" ] && mv "$f" "$DIR/documents/"; done
done

# Images
for ext in jpg jpeg png gif svg heic webp bmp tiff; do
  for f in "$DIR"/*.$ext; do [ -f "$f" ] && mv "$f" "$DIR/images/"; done
done

# Code
for ext in py ts js html css json yaml yml toml sql sh rb go rs; do
  for f in "$DIR"/*.$ext; do [ -f "$f" ] && mv "$f" "$DIR/code/"; done
done

# Media
for ext in mp4 mov avi mp3 wav flac aac mkv; do
  for f in "$DIR"/*.$ext; do [ -f "$f" ] && mv "$f" "$DIR/media/"; done
done

# Archives
for ext in zip tar gz rar 7z dmg iso; do
  for f in "$DIR"/*.$ext; do [ -f "$f" ] && mv "$f" "$DIR/archives/"; done
done

# Everything else goes to other
for f in "$DIR"/*; do
  [ -f "$f" ] && mv "$f" "$DIR/other/"
done

# Remove empty category directories
for d in documents images code media archives other; do
  rmdir "$DIR/$d" 2>/dev/null
done

echo "=== Organization complete ==="
echo ""
echo "Result:"
find "$DIR" -type f | sort
