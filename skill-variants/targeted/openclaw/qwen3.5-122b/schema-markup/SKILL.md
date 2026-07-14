---
name: schema-markup
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," "breadcrumb schema," "Google rich results," "knowledge panel," "star ratings in search," or "add structured data." Use this whenever someone wants their pages to show enhanced results in Google. For broader SEO issues, see seo-audit. For AI search optimization, see ai-seo.
metadata:
  version: 2.0.0
---

# Schema Markup — JSON-LD Generation

Generate schema.org structured data as JSON-LD. Read the source HTML carefully, extract all relevant data, and output valid JSON.

## Critical Rules

1. **Output pure JSON** — write a `.json` file containing only the JSON-LD object. No `<script>` tags, no HTML wrapper, no markdown code fences. Just valid JSON.
2. **Extract all data from the HTML** — read every relevant element. Do not skip items or fabricate values.
3. **Use exact values** — copy text, numbers, and names exactly as they appear in the HTML.
4. **Price must be a number** — use `1299.99` not `"$1,299.99"`. Strip currency symbols and commas.
5. **Availability must be a full schema.org URL** — use `"https://schema.org/InStock"` not `"InStock"`.
6. **Single top-level type** — when generating schema for one content type, use a flat object with `@context`, `@type`, and properties. Do NOT wrap in `@graph` unless multiple unrelated types are needed.

## FAQPage Schema Template

For FAQ pages, use this exact structure:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "The exact question text from the HTML",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The exact answer text from the HTML"
      }
    }
  ]
}
```

- Extract ALL questions — do not skip any
- `name` = the question heading text
- `acceptedAnswer.text` = the answer paragraph text
- Preserve the original text faithfully

## Product Schema Template

For product pages, use this exact structure:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description text",
  "brand": {
    "@type": "Organization",
    "name": "Brand Name"
  },
  "sku": "SKU-VALUE",
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

- `price` must be a **number**, not a string
- `ratingValue` must be a **number**, not a string
- `reviewCount` must be a **number**, not a string
- `availability` must use full URL: `https://schema.org/InStock`
- `brand` must be an object with `@type: "Organization"` and `name`

## Workflow

1. Read the HTML file completely
2. Identify the content type (FAQ, Product, Article, etc.)
3. Extract all required values from the HTML
4. Generate the JSON-LD following the template above
5. Write the output to the requested filename as pure JSON
