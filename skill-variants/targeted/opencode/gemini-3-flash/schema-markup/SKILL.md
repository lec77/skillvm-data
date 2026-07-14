---
name: schema-markup
description: When the user wants to add, fix, or optimize schema markup and structured data. Use when user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," or "Google rich results."
---

# Schema Markup — JSON-LD Structured Data

Generate valid JSON-LD structured data files from HTML content using schema.org vocabulary.

## Rules

1. Always use JSON-LD format
2. Output must be valid JSON — no comments, no trailing commas
3. `"@context": "https://schema.org"` at top level
4. Extract ALL values directly from the HTML — never invent data
5. Write output to the exact filename requested
6. Numeric values (`price`, `ratingValue`, `reviewCount`) MUST be numbers, NOT strings
7. Enumeration URLs must be full: `"https://schema.org/InStock"` not `"InStock"`
8. `brand` must be an object with `@type` and `name`, not a plain string

## Product Schema Template

When asked to create Product schema, output exactly this structure:

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
  "sku": "SKU value from HTML",
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

Critical field rules:
- `price`: strip "$" and commas, output as number (`"$1,299.99"` → `1299.99`)
- `priceCurrency`: 3-letter ISO code (e.g. `"USD"`)
- `availability`: full URL `"https://schema.org/InStock"` or `"https://schema.org/OutOfStock"`
- `ratingValue`: number (e.g. `4.6`)
- `reviewCount`: integer (e.g. `238`)
- `brand`: `{"@type": "Organization", "name": "BrandName"}` — never a plain string

## FAQPage Schema Template

When asked to create FAQ schema, output exactly this structure:

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
        "text": "The complete answer text from HTML."
      }
    }
  ]
}
```

Critical field rules:
- `mainEntity`: array containing ALL questions from the page
- Each item: `"@type": "Question"` with `"name"` set to the question text
- Each `acceptedAnswer`: `"@type": "Answer"` with `"text"` set to the full answer
- Preserve the complete text of each question and answer — do not summarize or truncate

## Workflow

1. Read the input HTML file completely
2. Identify the schema type needed (Product, FAQPage, etc.)
3. Extract all required values directly from the HTML content
4. Build the JSON-LD object following the exact template structure above
5. Write valid JSON to the requested output filename
