---
name: schema-markup
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," "breadcrumb schema," "Google rich results," "knowledge panel," "star ratings in search," or "add structured data." Use this whenever someone wants their pages to show enhanced results in Google. For broader SEO issues, see seo-audit. For AI search optimization, see ai-seo.
metadata:
  version: 2.0.0-gemini-3-flash
---

# Schema Markup

Generate schema.org structured data as JSON-LD. Output pure JSON files (no HTML wrapping) unless asked otherwise.

## Rules

- Use `"@context": "https://schema.org"` at the top level
- Only include properties whose values appear in the visible page content — don't fabricate data
- Use full schema.org URLs for enumerations: `"https://schema.org/InStock"` not `"InStock"`
- Numeric values like price, ratingValue, reviewCount must be numbers, not strings
- Extract text content accurately from the HTML — preserve exact wording for names/questions

## Product Schema

Required: name, image, offers (price + priceCurrency + availability)
Recommended: brand, sku, description, aggregateRating

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Widget",
  "description": "Our best-selling widget for professionals",
  "sku": "WIDGET-001",
  "brand": {
    "@type": "Brand",
    "name": "Example Co"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": 99.99,
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.8,
    "reviewCount": 127
  }
}
```

## FAQPage Schema

Required: mainEntity (array of Question objects with acceptedAnswer)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the product?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Full answer text extracted from the page..."
      }
    }
  ]
}
```

Extract every Q&A pair. Each Question needs `name` (the question text) and `acceptedAnswer` with `@type: "Answer"` and `text` (the full answer).
