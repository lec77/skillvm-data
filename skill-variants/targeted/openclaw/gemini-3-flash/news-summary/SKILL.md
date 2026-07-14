---
name: news-summary
description: Use when the user asks for news updates, daily briefings, or what's happening in the world. Fetches news from RSS feeds and creates structured summaries.
---

# News Summary

Fetch and summarize news from RSS feeds. ALWAYS fetch ALL 4 feeds below for complete coverage.

## RSS Feeds — Fetch ALL 4

```bash
# Technology
curl -s "https://feeds.bbci.co.uk/news/technology/rss.xml"

# Business
curl -s "https://feeds.bbci.co.uk/news/business/rss.xml"

# World
curl -s "https://feeds.bbci.co.uk/news/world/rss.xml"

# Top stories / Science
curl -s "https://feeds.bbci.co.uk/news/rss.xml"
```

You MUST fetch all 4 feeds. Do not skip any.

## Parsing RSS XML

Extract titles and descriptions from RSS XML:
```bash
curl -s "URL" | grep -E "<title>|<description>|<pubDate>|<category>" | sed 's/<[^>]*>//g' | sed 's/^[ \t]*//'
```

For structured JSON output, extract all `<item>` fields: title, link, description, pubDate, category.

Convert pubDate to ISO 8601 format (YYYY-MM-DD). Sort articles by date to find latest/oldest.

## Workflow

1. Fetch ALL 4 RSS feeds listed above
2. Parse each feed to extract articles with title, description, category, date
3. Group articles by feed category (Technology, Business, World, Science)
4. Create per-category summaries
5. Select top highlights spanning multiple categories

## JSON Output Format

When saving as JSON, use this structure:

```json
{
  "categories": [
    {
      "name": "Technology",
      "source": "tech feed name",
      "summary": "Overview of tech stories",
      "articles": [
        {"title": "...", "description": "...", "pub_date": "YYYY-MM-DD", "category": "..."}
      ]
    },
    {
      "name": "Business",
      "source": "business feed name",
      "summary": "Overview of business stories",
      "articles": [...]
    },
    {
      "name": "World",
      "source": "world feed name",
      "summary": "Overview of world stories",
      "articles": [...]
    },
    {
      "name": "Science",
      "source": "science feed name",
      "summary": "Overview of science stories",
      "articles": [...]
    }
  ],
  "highlights": [
    "Top story from any category",
    "Another major story from a different category"
  ]
}
```

Include ALL articles from ALL feeds. Highlights must reference stories from at least 2 different categories.

## Key Numbers

When articles mention statistics, numbers, or data points, extract them as key_numbers:
```json
{
  "key_numbers": [
    {"value": "5 megajoules", "context": "energy produced by fusion reactor"}
  ]
}
```

Extract at least 8 key numbers from across all articles.
