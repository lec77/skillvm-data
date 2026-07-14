---
name: news-summary
description: Fetch news from RSS feeds and create structured summaries. Use when the user asks for news updates, daily briefings, or what's happening in the world.
---

# News Summary

Fetch and summarize news from trusted RSS feeds.

## RSS Feeds

```bash
# Tech
curl -s "https://feeds.bbci.co.uk/news/technology/rss.xml"
# Business
curl -s "https://feeds.bbci.co.uk/news/business/rss.xml"
# World
curl -s "https://feeds.bbci.co.uk/news/world/rss.xml"
# Top/Science
curl -s "https://feeds.bbci.co.uk/news/rss.xml"
```

## Parse RSS

Extract titles and descriptions from XML:
```bash
curl -s "<url>" | grep -E "<title>|<description>" | sed 's/<[^>]*>//g' | sed 's/^[ \t]*//' | head -30
```

## Output Format

Save as `digest.json`. Use this exact structure:

```json
{
  "categories": [
    {
      "name": "technology",
      "source": "TechWire Daily",
      "articles": [
        {
          "headline": "...",
          "summary": "...",
          "category": "AI",
          "date": "2026-03-11"
        }
      ]
    },
    {
      "name": "business",
      "source": "Global Business Report",
      "articles": [...]
    },
    {
      "name": "world",
      "source": "World News Network",
      "articles": [...]
    },
    {
      "name": "science",
      "source": "Science Frontiers",
      "articles": [...]
    }
  ],
  "highlights": [
    "Top story spanning multiple categories...",
    "Another key highlight from a different feed..."
  ]
}
```

Key rules:
- `categories` MUST be an array of objects (not an object of arrays)
- Each category object has `name`, `source`, and `articles` fields
- `highlights` is a top-level array of cross-category key stories (at least 3-4 items spanning multiple feed categories)
- Include ALL articles from each feed
- Keep summaries concise (1-2 sentences)
- Include specific numbers and data from articles

## For Single-Article Tasks

When parsing a single RSS feed file to `articles.json`:
- `feed_title`: channel title
- `feed_description`: channel description
- `article_count`: number of items
- `articles`: array with `title`, `link`, `description`, `pub_date` (ISO 8601 YYYY-MM-DD), `category`
- `categories`: sorted unique category names
- `latest_article` / `oldest_article`: titles by date

## For Article Summarization Tasks

When summarizing articles from `stories.json` to `digest.json`:
- `article_count`: number of articles
- `date_range`: `{ "earliest": "YYYY-MM-DD", "latest": "YYYY-MM-DD" }`
- `summaries`: array of `{ "title", "source", "one_line_summary" (max 20 words), "topic" }`
- `key_numbers`: array of `{ "value", "context" }` — extract at least 8 notable statistics
- `top_story`: title of the most significant story
