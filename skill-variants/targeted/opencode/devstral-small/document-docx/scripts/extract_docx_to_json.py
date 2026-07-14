#!/usr/bin/env python3
"""Extract structured data from a .docx file to JSON.

Usage: python extract_docx_to_json.py input.docx output.json

Extracts all text content organized by paragraphs and tables.
Output format:
{
  "paragraphs": ["text1", "text2", ...],
  "tables": [
    {
      "headers": ["col1", "col2"],
      "rows": [["val1", "val2"], ...]
    }
  ]
}
"""
import sys
import json
import zipfile
import re
from xml.etree import ElementTree as ET

NS = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
}

def get_text(elem):
    """Get all text from an element."""
    texts = []
    for t in elem.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
        if t.text:
            texts.append(t.text)
    return ''.join(texts)

def extract(docx_path):
    with zipfile.ZipFile(docx_path, 'r') as z:
        xml = z.read('word/document.xml')
    root = ET.fromstring(xml)
    body = root.find('.//w:body', NS)

    paragraphs = []
    tables = []

    for child in body:
        tag = child.tag.split('}')[1] if '}' in child.tag else child.tag

        if tag == 'p':
            text = get_text(child)
            if text.strip():
                paragraphs.append(text.strip())

        elif tag == 'tbl':
            rows_data = []
            for tr in child.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tr'):
                row = []
                for tc in tr.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tc'):
                    row.append(get_text(tc).strip())
                rows_data.append(row)

            if rows_data:
                tables.append({
                    'headers': rows_data[0],
                    'rows': rows_data[1:]
                })

    return {'paragraphs': paragraphs, 'tables': tables}

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python extract_docx_to_json.py input.docx output.json")
        sys.exit(1)
    data = extract(sys.argv[1])
    with open(sys.argv[2], 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Extracted to {sys.argv[2]}")
