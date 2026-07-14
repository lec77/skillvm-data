---
name: news-summary
description: This skill should be used when the user asks for news updates, daily briefings, or what's happening in the world. Fetches news from trusted international RSS feeds and produces structured JSON summaries.
---

# News Summary

Fetch and summarize news from RSS feeds into structured JSON.

## RSS Feed URLs

```
https://feeds.bbci.co.uk/news/technology/rss.xml
https://feeds.bbci.co.uk/news/business/rss.xml
https://feeds.bbci.co.uk/news/world/rss.xml
https://feeds.bbci.co.uk/news/rss.xml
https://www.reutersagency.com/feed/?best-regions=world&post_type=best
https://feeds.npr.org/1001/rss.xml
https://www.aljazeera.com/xml/rss/all.xml
```

## Parsing RSS XML

Use `execute_command` with curl to fetch feeds. Parse XML to extract articles:

Each `<item>` contains: `<title>`, `<link>`, `<description>`, `<pubDate>`, `<category>`.

Convert `<pubDate>` (e.g. "Wed, 12 Mar 2026 14:30:00 GMT") to ISO 8601 format (e.g. "2026-03-12T14:30:00.000Z"). Use JavaScript Date parsing: `new Date(pubDate).toISOString()`.

The channel-level `<title>` and `<description>` are the feed metadata (found before the first `<item>`).

## Task: Parse RSS Feed

When asked to parse an RSS feed file into JSON, produce this exact structure:

```json
{
  "feed_title": "<channel title>",
  "feed_description": "<channel description>",
  "article_count": 6,
  "articles": [
    {
      "title": "Article Title",
      "link": "https://...",
      "description": "Article description text",
      "pub_date": "2026-03-12T14:30:00.000Z",
      "category": "AI"
    }
  ],
  "categories": ["AI", "Hardware", "Policy"],
  "latest_article": "Title of most recent article by date",
  "oldest_article": "Title of oldest article by date"
}
```

Steps:
1. Read the XML file
2. Extract channel `<title>` and `<description>` (strip CDATA wrappers if present)
3. Extract all `<item>` elements into articles array with the 5 fields above
4. Convert all dates to ISO 8601 format
5. Collect unique categories and sort alphabetically
6. Find latest and oldest articles by comparing parsed dates
7. Write JSON to the output file

## Task: Summarize Articles

When asked to create a digest from article data, produce:

```json
{
  "article_count": 5,
  "date_range": {
    "earliest": "2026-03-08",
    "latest": "2026-03-11"
  },
  "summaries": [
    {
      "title": "Original Article Title",
      "source": "Source Name",
      "one_line_summary": "Brief summary in under 20 words",
      "topic": "Energy"
    }
  ],
  "key_numbers": [
    {
      "value": "5 megajoules",
      "context": "Energy output achieved in fusion experiment"
    }
  ],
  "top_story": "Most Significant Article Title"
}
```

Steps:
1. Read the input JSON file
2. For each article: keep exact title and source, write a one_line_summary (max 20 words), assign a topic
3. Valid topics: Energy, Technology, Transportation, Business
4. Extract ALL notable numbers/statistics from every article — aim for 8+ key_numbers. Each must have a `value` and `context` field. Include numbers about quantities, durations, percentages, monetary amounts, etc.
5. Set date_range from the earliest and latest article dates (YYYY-MM-DD format)
6. Pick the most significant story as top_story (use the exact original title)

## Task: Multi-Feed News Briefing

When asked for a news briefing from multiple feeds:

1. Fetch ALL feeds. Use curl to fetch each feed URL.
2. Parse each feed's XML to extract articles (title, description, category, date)
3. Group articles into categories: Tech, Business, World, Science (or similar)
4. For each category, write a brief summary covering the key stories
5. Create a highlights section selecting the most important stories across ALL categories

Output as `digest.json`:

```json
{
  "categories": [
    {
      "name": "Tech",
      "source": "TechWire Daily",
      "articles": [
        {"title": "...", "description": "...", "date": "..."}
      ],
      "summary": "Brief overview of tech stories"
    }
  ],
  "highlights": [
    {
      "title": "Most Important Story",
      "category": "Tech",
      "why": "Brief reason this is significant"
    },
    {
      "title": "Second Important Story",
      "category": "Science",
      "why": "Brief reason"
    }
  ]
}
```

The highlights array MUST include stories from at least 2 different categories to provide a balanced briefing.
