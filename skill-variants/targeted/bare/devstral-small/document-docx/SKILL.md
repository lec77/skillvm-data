---
name: document-docx
description: "Create, read, and extract data from Word .docx files. Procedure: (1) run: pip install python-docx, (2) write a Python script, (3) save as .py file, (4) run with python3. CREATE docs: from docx import Document; doc=Document(); doc.add_heading('Title',level=1); doc.add_paragraph('text'); doc.add_paragraph('item',style='List Bullet'); table=doc.add_table(rows=1,cols=N); table.style='Table Grid'; hdr=table.rows[0].cells; row=table.add_row().cells; doc.save('out.docx'). EXTRACT text: from docx import Document; doc=Document('file.docx'); lines=[p.text for p in doc.paragraphs]; for t in doc.tables: lines+=['\\t'.join(c.text for c in r.cells) for r in t.rows]; open('out.txt','w').write('\\n'.join(lines)). EXTRACT to JSON: read paragraphs with 'Key: Value' pattern using split(':',1), read tables with headers=table.rows[0] and data=table.rows[1:], strip $ and commas from numbers with s.replace('$','').replace(',',''), convert to float/int, write with json.dump(). Use this for ANY .docx task."
---

# Working with DOCX files

Use **python-docx** for ALL docx operations. Install: `pip install python-docx`

## Creating a DOCX

```python
from docx import Document

doc = Document()
doc.add_heading('Title', level=1)
doc.add_paragraph('Body text here.')
doc.add_heading('Section', level=2)
doc.add_paragraph('Bullet item', style='List Bullet')
table = doc.add_table(rows=1, cols=3)
table.style = 'Table Grid'
hdr = table.rows[0].cells
hdr[0].text = 'Col1'
hdr[1].text = 'Col2'
hdr[2].text = 'Col3'
row = table.add_row().cells
row[0].text = 'a'
row[1].text = 'b'
row[2].text = 'c'
doc.save('output.docx')
```

## Extracting text

```python
from docx import Document

doc = Document('input.docx')
lines = []
for para in doc.paragraphs:
    lines.append(para.text)
for table in doc.tables:
    for row in table.rows:
        lines.append('\t'.join(cell.text for cell in row.cells))
with open('output.txt', 'w') as f:
    f.write('\n'.join(lines))
```

## Extracting to JSON

```python
from docx import Document
import json

doc = Document('input.docx')
data = {}

def to_num(s):
    s = s.replace('$', '').replace(',', '').strip()
    try:
        return int(s) if '.' not in s else float(s)
    except:
        return s

for p in doc.paragraphs:
    t = p.text.strip()
    if ':' in t:
        k, v = t.split(':', 1)
        data[k.strip()] = v.strip()

for table in doc.tables:
    hdrs = [c.text.strip() for c in table.rows[0].cells]
    items = []
    for row in table.rows[1:]:
        vals = [c.text.strip() for c in row.cells]
        items.append(dict(zip(hdrs, vals)))
    data['items'] = items

with open('output.json', 'w') as f:
    json.dump(data, f, indent=2)
```
