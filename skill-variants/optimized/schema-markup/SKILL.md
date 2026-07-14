---
name: schema-markup
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," "breadcrumb schema," "Google rich results," "knowledge panel," "star ratings in search," or "add structured data." Use this whenever someone wants their pages to show enhanced results in Google. For broader SEO issues, see seo-audit. For AI search optimization, see ai-seo.
metadata:
  version: 2.0.0
---

# Schema Markup

Generate schema.org structured data as JSON-LD. Focus on accuracy, Google eligibility, and proper entity linking.

## Format Rules

- Use JSON-LD in a `<script type="application/ld+json">` tag
- When a page has multiple schema types, wrap them in a single `@graph` array with one shared `@context`. This is cleaner than separate script tags or a top-level array:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://example.com/#org", ... },
    { "@type": "WebSite", "publisher": { "@id": "https://example.com/#org" }, ... }
  ]
}
```

- Use `@id` to cross-reference entities within the graph rather than duplicating nested objects. For example, reference an Organization by `{"@id": "https://example.com/#org"}` instead of repeating the full object.

## Common Pitfalls

These are mistakes that produce valid JSON-LD but fail Google's Rich Results Test or don't generate rich snippets:

**Enumeration values must be full URLs.** Write `"availability": "https://schema.org/InStock"`, not `"InStock"`. Same for `eventStatus`, `eventAttendanceMode`, `itemCondition`.

**Dates must be ISO 8601.** Use `"2025-03-15"` or `"2025-03-15T09:00:00-07:00"`, never `"March 15, 2025"`. Durations use `PT` format: `"PT30M"`, `"PT1H15M"`.

**Don't fabricate data.** Only include properties whose values appear in the visible page content. If the page doesn't show a price, don't invent one. Mismatched schema is a spam signal.

**Images need absolute URLs.** Relative paths like `/images/photo.jpg` won't validate. Use fully qualified URLs.

**AggregateRating:** Use `ratingCount` for number of ratings, `reviewCount` for number of text reviews. Include `bestRating` when the scale isn't 1-5.

## Schema Type Selection

Pick the most specific type. Use `Dentist` not `LocalBusiness`, `SportsEvent` not `Event`, `BlogPosting` not `Article` (when appropriate).

For pages with multiple content types, always include `BreadcrumbList` alongside the primary schema — it has the highest acceptance rate for rich results across all page types.

## Required Properties by Type

Only generate markup Google actually supports for rich results. These are the required minimums:

| Type | Required | Recommended |
|------|----------|-------------|
| Article | headline, image, datePublished, author (Person with name) | dateModified, publisher |
| Product | name, image, offers (price + priceCurrency + availability) | brand, sku, aggregateRating, review |
| FAQPage | mainEntity → Question[] → acceptedAnswer → Answer | — |
| Recipe | name, image, author, datePublished, recipeIngredient, recipeInstructions (HowToStep[]) | prepTime, cookTime, recipeYield, nutrition, aggregateRating |
| LocalBusiness | name, address | telephone, openingHoursSpecification, aggregateRating, priceRange, sameAs, geo |
| Event | name, startDate, location, eventAttendanceMode | endDate, offers, organizer, eventStatus, performer |
| HowTo | name, step (HowToStep[]) | totalTime, description |
| BreadcrumbList | itemListElement (ListItem[] with position, name, item) | — |

## Hybrid/Multi-Location Events

For events with both in-person and virtual attendance:
- Set `eventAttendanceMode` to `https://schema.org/MixedEventAttendanceMode`
- Use `location` as an array containing both a `Place` and a `VirtualLocation`

## Implementation

**Static HTML:** Place `<script type="application/ld+json">` in `<head>` or before `</body>`.

**React/Next.js:** Render the JSON-LD server-side. Use `dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}` inside a script tag in your Head component.

**Validation:** Test with Google's Rich Results Test before deploying.
