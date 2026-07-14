---
name: schema-markup
description: When the user wants to add, fix, or optimize schema markup and structured data. Use when user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," or "Google rich results."
---

# Schema Markup — JSON-LD Structured Data

Generate valid JSON-LD structured data files from HTML content using schema.org vocabulary.

## Rules

1. Always use JSON-LD format (not Microdata or RDFa)
2. Output must be valid JSON — no comments, no trailing commas
3. `"@context": "https://schema.org"` at top level
4. Extract ALL values directly from the HTML — never invent or fabricate data
5. Write output to the exact filename requested by the user
6. Numeric values (`price`, `ratingValue`, `reviewCount`) must be numbers, not strings
7. Enumeration URLs must be full: `"https://schema.org/InStock"` not `"InStock"`

## Product Schema Template

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "exact product name from HTML",
  "description": "product description from HTML",
  "brand": {
    "@type": "Organization",
    "name": "brand name from HTML"
  },
  "sku": "SKU from HTML",
  "offers": {
    "@type": "Offer",
    "price": 123.99,
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

Field requirements:
- `price`: number only — strip "$" and commas (e.g. "$1,299.99" → 1299.99)
- `priceCurrency`: 3-letter ISO code (e.g. "USD")
- `availability`: full URL like `https://schema.org/InStock`
- `ratingValue`: number (e.g. 4.6)
- `reviewCount`: integer (e.g. 238)
- `brand`: object with `@type` and `name`, not a plain string

## FAQPage Schema Template

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "The exact question text from HTML?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The exact answer text from HTML."
      }
    }
  ]
}
```

Field requirements:
- `mainEntity`: array containing ALL questions from the page
- Each item: `"@type": "Question"` with `"name"` (question text)
- Each `acceptedAnswer`: `"@type": "Answer"` with `"text"` (answer text)
- Preserve the complete text of each question and answer — do not summarize or truncate

## Workflow

1. Read the input HTML file completely
2. Identify the schema type needed (Product, FAQPage, etc.)
3. Extract all required values directly from the HTML content
4. Build the JSON-LD object following the exact template structure above
5. Write the JSON-LD to the requested output filename
6. Verify the output is valid JSON with no comments or trailing commas
