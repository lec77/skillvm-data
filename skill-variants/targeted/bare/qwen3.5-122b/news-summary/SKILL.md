---
name: news-summary
description: Use when asked for news updates, briefings, or summarizing news articles/feeds. Handles RSS parsing, article summarization, and news digest creation.
---

# News Summary Skill

## Core Capabilities

1. **Parse RSS/XML feeds** → extract structured article data
2. **Summarize news articles** → create categorized digests with statistics
3. **Multi-feed aggregation** → combine multiple feeds into one digest

## RSS Feed URLs

```
https://feeds.bbci.co.uk/news/world/rss.xml
https://feeds.bbci.co.uk/news/rss.xml
https://feeds.bbci.co.uk/news/business/rss.xml
https://feeds.bbci.co.uk/news/technology/rss.xml
```

## How to Parse RSS XML

Use `execute_command` with this pattern to extract articles from an RSS XML file:

```bash
cat feed.xml
```

Then parse the XML content. RSS items are inside `<item>` tags with these child elements:
- `<title>` - article title
- `<link>` - article URL
- `<description>` - article summary text
- `<pubDate>` - publication date (convert to YYYY-MM-DD format)
- `<category>` - topic category

The channel metadata is at the top: `<title>`, `<description>`, `<link>`.

## How to Fetch Remote RSS Feeds

```bash
curl -s "URL_HERE"
```

When fetching multiple feeds, run each curl separately and parse each response.

## Task: Parse RSS Feed → articles.json

When asked to parse an RSS feed file, create a JSON file with this EXACT structure:

```json
{
  "feed_title": "channel title from XML",
  "feed_description": "channel description from XML",
  "article_count": 6,
  "articles": [
    {
      "title": "Article Title",
      "link": "https://...",
      "description": "Article description text",
      "pub_date": "2026-03-12",
      "category": "AI"
    }
  ],
  "categories": ["AI", "Hardware", "Policy", "Quantum", "Security", "Space"],
  "latest_article": "Title of most recent article by date",
  "oldest_article": "Title of oldest article by date"
}
```

Important rules:
- `pub_date` MUST be ISO 8601 format: YYYY-MM-DD (e.g., "2026-03-12")
- `categories` MUST be sorted alphabetically
- `latest_article` and `oldest_article` are the TITLES (strings), determined by comparing pub_date values
- `article_count` is the total number of items

## Task: Summarize Articles → digest.json

When given a JSON file with news articles, create digest.json:

```json
{
  "article_count": 5,
  "date_range": {
    "earliest": "2026-03-08",
    "latest": "2026-03-11"
  },
  "summaries": [
    {
      "title": "Exact Article Title From Source",
      "source": "Source Name",
      "one_line_summary": "Brief summary under 20 words",
      "topic": "Energy"
    }
  ],
  "key_numbers": [
    {
      "value": "5 megajoules",
      "context": "Energy produced by fusion reaction"
    }
  ],
  "top_story": "Exact Title of Most Significant Story"
}
```

Important rules:
- `topic` must be one of: "Energy", "Technology", "Transportation", "Business"
- `one_line_summary` must be under 20 words
- Extract at least 8 key numbers from ALL articles - look for every statistic, percentage, dollar amount, quantity
- `top_story` must be the exact title string from the source articles
- `date_range.earliest` and `date_range.latest` are YYYY-MM-DD strings

## Task: Multi-Feed News Digest → digest.json

When asked for a news briefing, fetch available RSS feeds, then create digest.json:

```json
{
  "categories": [
    {
      "name": "Technology",
      "source": "tech",
      "summary": "Overview of tech news themes",
      "articles": [
        {
          "title": "Article Title",
          "description": "Brief description",
          "date": "2026-03-11"
        }
      ]
    }
  ],
  "highlights": [
    "Key highlight spanning multiple categories",
    "Another important cross-category highlight"
  ]
}
```

Important rules:
- Include ALL articles from ALL feeds - do not skip any
- Create category groupings that cover: tech, business, world, science
- The `highlights` array must reference stories from at least 2 different feed categories
- Include a `summary` field in each category with an overview
- Preserve key details: names, numbers, statistics from article descriptions
