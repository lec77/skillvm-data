---
name: news-summary
description: This skill should be used when the user asks for news updates, daily briefings, or what's happening in the world. Fetches news from trusted international RSS feeds and creates structured summaries.
---

# News Summary

Fetch and summarize news from trusted international sources via RSS feeds.

## RSS Feeds

```bash
curl -s "https://feeds.bbci.co.uk/news/world/rss.xml"
curl -s "https://feeds.bbci.co.uk/news/rss.xml"
curl -s "https://feeds.bbci.co.uk/news/business/rss.xml"
curl -s "https://feeds.bbci.co.uk/news/technology/rss.xml"
```

## Parse RSS

Extract `<title>`, `<link>`, `<description>`, `<pubDate>`, `<category>` from each `<item>`. Convert pubDate to ISO 8601 (YYYY-MM-DD).

## Output: articles.json (single feed parsing)

```json
{
  "feed_title": "Feed Name",
  "feed_description": "Description",
  "article_count": 6,
  "articles": [{"title":"...","link":"...","description":"...","pub_date":"2026-03-12","category":"AI"}],
  "categories": ["AI", "Hardware", "Security"],
  "latest_article": "Most recent by date",
  "oldest_article": "Oldest by date"
}
```

- `categories`: unique values sorted alphabetically
- `latest_article`/`oldest_article`: determined by pub_date

## Output: digest.json (article summarization)

```json
{
  "article_count": 5,
  "date_range": {"earliest": "2026-03-08", "latest": "2026-03-11"},
  "summaries": [{"title":"...","source":"...","one_line_summary":"Under 20 words","topic":"Energy"}],
  "key_numbers": [{"value": "5 megajoules", "context": "Fusion energy output"}],
  "top_story": "Most significant article title"
}
```

- `topic`: one of Energy, Technology, Transportation, Business
- `key_numbers`: extract 8+ significant numbers
- `top_story`: must match an actual article title

## Output: digest.json (multi-feed news briefing)

IMPORTANT: Fetch all feeds in ONE bash command using `&` for parallel background fetching:

```bash
curl -s "URL1" > /tmp/feed1.xml & curl -s "URL2" > /tmp/feed2.xml & curl -s "URL3" > /tmp/feed3.xml & curl -s "URL4" > /tmp/feed4.xml & wait
```

CRITICAL: `categories` MUST be an ARRAY of objects, NOT a plain object:

```json
{
  "categories": [
    {"name": "tech", "feed": "tech", "summary": "...", "articles": [{"title": "...", "description": "..."}]},
    {"name": "business", "feed": "business", "summary": "...", "articles": [...]},
    {"name": "world", "feed": "world", "summary": "...", "articles": [...]},
    {"name": "science", "feed": "science", "summary": "...", "articles": [...]}
  ],
  "highlights": ["Cross-category highlight 1", "Cross-category highlight 2"]
}
```

Use lowercase names: "tech", "business", "world", "science". Include ALL articles. `highlights` should reference stories from 2+ categories.
