---
name: schema-markup
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," "breadcrumb schema," "Google rich results," "knowledge panel," "star ratings in search," or "add structured data." Use this whenever someone wants their pages to show enhanced results in Google. For broader SEO issues, see seo-audit. For AI search optimization, see ai-seo.
metadata:
  version: 2.0.0
---

# Schema Markup

Generate valid JSON-LD structured data from page content. Always use `"@context": "https://schema.org"`. Read the source HTML first, then extract all relevant data into the correct schema type.

## Key Rules
- Output valid JSON (no comments, no trailing commas)
- Use JSON-LD format with `@context` and `@type`
- Extract data accurately from page content — never invent data
- Use full schema.org URLs for enumerated values (e.g., `https://schema.org/InStock`)
- Numeric values like price, rating can be numbers or strings

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

Required: name, description, sku, brand, offers (with price + priceCurrency + availability), aggregateRating (with ratingValue + reviewCount).

## FAQPage Schema

```json
{
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
```

Extract ALL questions and answers from the page. Each Q&A pair needs `@type: Question`, `name` (question text), and `acceptedAnswer` with `@type: Answer` and `text`.

## Other Common Types

| Type | Required Fields |
|------|----------------|
| Organization | name, url |
| Article | headline, image, datePublished, author |
| BreadcrumbList | itemListElement (position, name, item) |
| LocalBusiness | name, address |
| Event | name, startDate, location |
| HowTo | name, step |

## Workflow
1. Read the input HTML file
2. Identify the schema type needed
3. Extract all relevant data from the HTML
4. Write valid JSON-LD to the output file
