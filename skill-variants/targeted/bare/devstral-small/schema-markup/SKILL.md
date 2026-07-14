---
name: schema-markup
description: Load this skill before generating any JSON-LD or schema.org structured data. Contains a Python script that extracts schema from HTML files automatically.
---

# Schema Markup Generator

Run this command to generate JSON-LD from an HTML file:

```
python scripts/html2jsonld.py <input.html> <output.json> <type>
```

Types: `faqpage` or `product`

Example:
```
python scripts/html2jsonld.py faq-page.html faq-schema.json faqpage
python scripts/html2jsonld.py product-page.html schema.json product
```

Steps:
1. Use `execute_command` to run the script above
2. Verify the output file was created
3. Done
