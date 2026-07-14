---
name: schema-markup
description: Generate JSON-LD structured data files from HTML pages using schema.org vocabulary.
---

# Schema Markup — JSON-LD Generation

## Rules

1. Read the HTML file first — extract values from page content, never invent data
2. Always include `"@context": "https://schema.org"`
3. Prices, ratings, counts MUST be numbers not strings (`1299.99` not `"1299.99"`)
4. Enum values MUST be full URLs (`"https://schema.org/InStock"` not `"InStock"`)
5. Save to the exact filename requested

## How to Write JSON Files

IMPORTANT: Do NOT use `python3 -c` for writing JSON — quoting issues will break it.

Instead, write a Python helper script, then run it:

**Step 1**: Write a file called `gen.py` that builds and saves the JSON.
**Step 2**: Run `python3 gen.py` with bash.
**Step 3**: Read the output JSON file to verify correctness.

## Product Schema → `schema.json`

After reading the HTML, write `gen.py` like this (replace values with extracted data):

```python
import json

data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "PRODUCT_NAME",
    "description": "DESCRIPTION",
    "brand": {"@type": "Organization", "name": "BRAND"},
    "sku": "SKU_VALUE",
    "offers": {
        "@type": "Offer",
        "price": 0.00,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 0.0,
        "reviewCount": 0
    }
}

with open("schema.json", "w") as f:
    json.dump(data, f, indent=2)
```

- `price` = number like `1299.99`
- `ratingValue` = number like `4.6`
- `reviewCount` = integer like `238`
- `brand` has `@type: "Organization"` and `name`
- `availability` = full URL `"https://schema.org/InStock"`

## FAQPage Schema → `faq-schema.json`

After reading the HTML, write `gen.py` like this (include ALL questions):

```python
import json

data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Question text here?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Answer text here."
            }
        }
    ]
}

with open("faq-schema.json", "w") as f:
    json.dump(data, f, indent=2)
```

- Include ALL questions — count them first, make sure none are missing
- `name` = question text from the heading
- `text` = full answer text from the paragraph

## Workflow

1. Read the HTML file
2. Extract all required values
3. Write a `gen.py` script that builds the JSON data and saves it
4. Run `python3 gen.py`
5. Read the output JSON file to verify it is correct
