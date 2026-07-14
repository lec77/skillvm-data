---
name: schema-markup
description: Generate schema.org structured data as JSON-LD for web pages. Use when the user mentions schema markup, structured data, JSON-LD, rich snippets, FAQ schema, product schema, or Google rich results.
metadata:
  version: 2.0.0
---

# Schema Markup

Generate schema.org structured data as JSON-LD. Focus on accuracy and proper structure.

## Rules

- Use JSON-LD format with `@context: "https://schema.org"`
- Extract data only from actual page content — never fabricate
- Use exact schema.org enumeration URLs (e.g., `https://schema.org/InStock`)
- Dates in ISO 8601 format
- Numbers as numbers, not strings (price: 29.99 not "29.99")
- Use `reviewCount` for Product ratings, `ratingCount` for SoftwareApplication

## Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "description": "...",
  "sku": "...",
  "brand": { "@type": "Organization", "name": "..." },
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

## FAQPage Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text here",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text here"
      }
    }
  ]
}
```

Extract ALL questions and answers from the page. Each Q&A pair is a Question object in the mainEntity array.

## Output

Write the JSON-LD to the requested output file as valid JSON.
