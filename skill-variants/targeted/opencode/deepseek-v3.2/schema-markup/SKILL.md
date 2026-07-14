---
name: schema-markup
description: Generate JSON-LD structured data files from HTML pages using schema.org vocabulary.
---

# Schema Markup — JSON-LD Generation

Generate valid JSON-LD structured data by reading HTML pages and extracting content into `.json` files.

## Critical Rules

1. **Read the HTML file first** — extract every value from the actual page content, never invent data
2. **Valid JSON only** — no comments, no trailing commas
3. **Always include** `"@context": "https://schema.org"`
4. **Numeric values** — prices, ratings, and counts must be numbers, not strings (`1299.99` not `"1299.99"`, `238` not `"238"`)
5. **Full schema.org URLs for enumerations** — e.g. `"https://schema.org/InStock"` not just `"InStock"`
6. **Save to the exact filename requested**

## Product Schema → `schema.json`

When asked to generate Product schema from an HTML product page:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Exact product name from the page",
  "description": "Product description extracted from the page",
  "brand": {
    "@type": "Organization",
    "name": "Brand name from the page"
  },
  "sku": "SKU value from the page",
  "offers": {
    "@type": "Offer",
    "price": 99.99,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 100
  }
}
```

Key points:
- `price` must be a number (e.g. `1299.99`)
- `ratingValue` must be a number (e.g. `4.6`)
- `reviewCount` must be an integer (e.g. `238`)
- `availability` must use full URL like `"https://schema.org/InStock"`
- `brand` uses `@type: "Organization"` with a `name` property

## FAQPage Schema → `faq-schema.json`

When asked to generate FAQ schema from an HTML FAQ page:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "The exact question text from the HTML heading?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The answer text extracted from the HTML paragraph."
      }
    }
  ]
}
```

Key points:
- Include ALL questions from the page — count them and make sure none are missing
- `name` is the question text (from the heading element)
- `acceptedAnswer` must have `@type: "Answer"` and `text` with the full answer content
- `mainEntity` is an array containing every Question object

## Workflow

1. Read the HTML file completely
2. Identify what schema type is needed
3. Extract all required values from the HTML content
4. Write the JSON-LD to the requested output filename
5. Verify the output is valid JSON with correct types (numbers not strings)
