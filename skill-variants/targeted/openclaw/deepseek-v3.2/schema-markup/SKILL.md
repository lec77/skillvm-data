---
name: schema-markup
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," "breadcrumb schema," "Google rich results," "knowledge panel," "star ratings in search," or "add structured data." Use this whenever someone wants their pages to show enhanced results in Google. For broader SEO issues, see seo-audit. For AI search optimization, see ai-seo.
metadata:
  version: 3.0.0-deepseek-v3.2
---

# Schema Markup — JSON-LD Generation

Generate schema.org structured data as JSON-LD. Extract data accurately from the source content and output valid JSON.

## Output Rules

1. Output pure JSON-LD (no `<script>` wrapper unless placing in HTML)
2. Always include `"@context": "https://schema.org"` at the top level
3. Set `"@type"` to the correct schema.org type
4. Only include data that appears in the source content — never fabricate values

## Critical Formatting Rules

**Enumeration values MUST be full URLs:**
- `"availability": "https://schema.org/InStock"` — NOT `"InStock"`
- `"itemCondition": "https://schema.org/NewCondition"` — NOT `"NewCondition"`

**Prices MUST be numbers, not strings:**
- `"price": 1299.99` — NOT `"price": "$1,299.99"`
- Always include `"priceCurrency": "USD"` (or appropriate code)

**Ratings MUST be numbers:**
- `"ratingValue": 4.6` — NOT `"ratingValue": "4.6"`
- `"reviewCount": 238` — NOT `"reviewCount": "238"`

## Schema Patterns

### FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "The exact question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The exact answer text."
      }
    }
  ]
}
```

Rules for FAQPage:
- Each Q&A pair is a `Question` object in the `mainEntity` array
- `name` = the question text, `acceptedAnswer.text` = the answer text
- Include ALL questions from the source — do not skip any
- Preserve the original text accurately

### Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description from the page",
  "brand": {
    "@type": "Organization",
    "name": "Brand Name"
  },
  "sku": "SKU-123",
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

Rules for Product:
- `brand` must be an object with `@type: "Organization"` and `name`
- `offers` must include `@type: "Offer"`, numeric `price`, `priceCurrency`, and full-URL `availability`
- `aggregateRating` must include `@type: "AggregateRating"`, numeric `ratingValue`, and numeric `reviewCount`
- Extract `sku` if present on the page

## Validation Checklist

Before saving the output file:
- [ ] Valid JSON (no trailing commas, no comments)
- [ ] `@context` is `"https://schema.org"`
- [ ] `@type` matches the content type
- [ ] All values match visible page content exactly
- [ ] Enumeration values use full `https://schema.org/` URLs
- [ ] Numeric values (prices, ratings, counts) are numbers, not strings
