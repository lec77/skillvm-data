---
name: schema-markup
description: Generate JSON-LD structured data from HTML pages. Use when the user mentions schema markup, structured data, JSON-LD, rich snippets, schema.org, FAQ schema, product schema, or Google rich results.
metadata:
  version: 2.0.0
---

# Schema Markup

Generate valid JSON-LD schema.org markup by extracting data from HTML content.

## Rules

- Output valid JSON (no comments, no trailing commas)
- Use `"@context": "https://schema.org"`
- Extract all values from the HTML content — do not invent data
- Prices and ratings must be numbers, not strings (e.g. `1299.99` not `"1299.99"`)
- Use full schema.org URLs for enumerations (e.g. `"https://schema.org/InStock"`)
- `reviewCount` is the number of reviews (integer)

## Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description from page",
  "sku": "SKU-123",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
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
      "name": "Question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text from page."
      }
    }
  ]
}
```
Include ALL questions from the page. Each Question needs `name` (the question text) and `acceptedAnswer` with `@type: "Answer"` and `text` (the answer).

## Other Common Types

| Type | Required Properties |
|------|-------------------|
| Article | headline, image, datePublished, author |
| Organization | name, url |
| BreadcrumbList | itemListElement (position, name, item) |
| LocalBusiness | name, address |
| Event | name, startDate, location |

## Workflow

1. Read the HTML file
2. Identify the schema type needed
3. Extract all required values from the HTML
4. Write valid JSON-LD to the output file
5. Verify the output is valid JSON
