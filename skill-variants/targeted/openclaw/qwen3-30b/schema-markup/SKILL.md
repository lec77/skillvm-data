---
name: schema-markup
description: Generate schema.org JSON-LD structured data from HTML pages.
metadata:
  version: 2.2.0
---

# Schema Markup — JSON-LD Generator

Generate valid JSON-LD from HTML content.

## WORKFLOW (follow exactly)

1. Read the HTML file
2. Write the JSON file using the `bash` tool with a heredoc, NOT the `write` tool. Example:

```bash
cat > OUTPUT_FILENAME.json << 'ENDJSON'
{
  "@context": "https://schema.org",
  ...rest of JSON...
}
ENDJSON
```

3. Verify with: `cat OUTPUT_FILENAME.json | python3 -c "import json,sys; json.load(sys.stdin); print('VALID')"` — if it prints VALID, you're done. If not, fix and rewrite.

## FAQPage schema

Use `@type: "FAQPage"` with `mainEntity` array. Each item: `@type: "Question"`, `name` (question text), `acceptedAnswer` with `@type: "Answer"` and `text` (answer text). Extract ALL questions from the HTML.

## Product schema

Use `@type: "Product"`. Include: `name`, `description`, `brand` (as `{"@type":"Organization","name":"..."}"`), `sku`, `offers` (with `@type: "Offer"`, `price` as number no $ or commas, `priceCurrency`, `availability` as full URL like `https://schema.org/InStock`), `aggregateRating` (with `@type: "AggregateRating"`, `ratingValue`, `reviewCount`).
