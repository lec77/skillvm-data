#!/usr/bin/env python3
"""Extract plain text from a .docx file.

Usage: python extract_text.py input.docx output.txt
"""
import sys
import zipfile
import re

def extract_text(docx_path):
    """Extract text from docx by reading the XML directly."""
    with zipfile.ZipFile(docx_path, 'r') as z:
        xml = z.read('word/document.xml').decode('utf-8')
    # Get all text between <w:t> tags
    texts = re.findall(r'<w:t[^>]*>([^<]+)</w:t>', xml)
    return '\n'.join(texts)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python extract_text.py input.docx output.txt")
        sys.exit(1)
    text = extract_text(sys.argv[1])
    with open(sys.argv[2], 'w') as f:
        f.write(text)
    print(f"Extracted text to {sys.argv[2]}")
