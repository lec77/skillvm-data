---
name: schema-markup
description: When the user wants to add, fix, or optimize schema markup and structured data. Use when user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," or "Google rich results."
---

# Schema Markup — JSON-LD Structured Data

Generate valid JSON-LD structured data files from HTML content using schema.org vocabulary.

## Rules

1. Always use JSON-LD format (not Microdata or RDFa)
2. Output must be valid JSON — no comments, no trailing commas
3. Write output to the exact filename requested
4. Extract all values directly from the HTML content — do not invent data
5. Use `"@context": "https://schema.org"` at the top level

## Product Schema

When asked to create Product schema from an HTML page, output a JSON file with this exact structure:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "extracted product name",
  "description": "extracted product description",
  "brand": {
    "@type": "Organization",
    "name": "extracted brand name"
  },
  "sku": "extracted SKU",
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

Key details:
- `price` must be a number, not a string (no "$" or commas)
- `priceCurrency` is a 3-letter currency code
- `availability` must use full schema.org URL format: `https://schema.org/InStock`, `https://schema.org/OutOfStock`, etc.
- `ratingValue` is a number
- `reviewCount` is a number

## FAQPage Schema

When asked to create FAQ schema from an HTML page, output a JSON file with this exact structure:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "The question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The answer text."
      }
    }
  ]
}
```

Key details:
- `mainEntity` is an array of Question objects
- Each Question has `"@type": "Question"` and `"name"` (the question text)
- Each `acceptedAnswer` has `"@type": "Answer"` and `"text"` (the answer text)
- Extract ALL questions from the HTML, preserving their full text

## Workflow

1. Read the input HTML file completely
2. Identify the schema type needed from the task prompt
3. Extract all required values from the HTML
4. Write the JSON-LD to the requested output filename
5. Verify the output is valid JSON
