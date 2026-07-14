---
name: news-summary
description: Use when asked for news updates, briefings, or summarizing articles/feeds. Fetches RSS feeds, parses XML, and creates structured JSON digests.
---

# News Summary

Fetch, parse, and summarize news from RSS feeds into structured JSON.

## RSS Feed URLs

Fetch these 4 feeds to get comprehensive coverage:

```bash
# Technology
curl -s "https://feeds.bbci.co.uk/news/technology/rss.xml"

# Business
curl -s "https://feeds.bbci.co.uk/news/business/rss.xml"

# World news
curl -s "https://feeds.bbci.co.uk/news/world/rss.xml"

# Top stories / Science
curl -s "https://feeds.bbci.co.uk/news/rss.xml"
```

## Fetching Multiple Feeds

IMPORTANT: When fetching multiple RSS feeds, fetch each feed with a **separate curl command** and save to separate files. Do NOT fetch all feeds in a single script — feeds may be slow and cause timeouts.

```bash
# Fetch each feed separately and save to files
curl -s "https://feeds.bbci.co.uk/news/technology/rss.xml" -o feed_tech.xml &
curl -s "https://feeds.bbci.co.uk/news/business/rss.xml" -o feed_business.xml &
curl -s "https://feeds.bbci.co.uk/news/world/rss.xml" -o feed_world.xml &
curl -s "https://feeds.bbci.co.uk/news/rss.xml" -o feed_science.xml &
wait
```

Or fetch them one-by-one with individual commands if parallel execution isn't available. Then parse the saved XML files with Python.

## Parse RSS XML

Use Python `xml.etree.ElementTree` for reliable parsing:

```python
import xml.etree.ElementTree as ET, json
from datetime import datetime

tree = ET.parse("feed.xml")  # or ET.fromstring(xml_string)
channel = tree.getroot().find("channel")

feed_title = channel.find("title").text
feed_description = channel.find("description").text

articles = []
for item in channel.findall("item"):
    pub_str = item.find("pubDate").text  # e.g. "Thu, 12 Mar 2026 07:30:00 GMT"
    dt = datetime.strptime(pub_str, "%a, %d %b %Y %H:%M:%S %Z")
    articles.append({
        "title": item.find("title").text,
        "link": item.find("link").text,
        "description": item.find("description").text,
        "pub_date": dt.strftime("%Y-%m-%d"),
        "category": item.find("category").text if item.find("category") is not None else ""
    })
```

## Output Formats

### Single feed → articles.json
```json
{
  "feed_title": "Tech Daily News",
  "feed_description": "Latest technology news",
  "article_count": 6,
  "articles": [{"title": "...", "link": "...", "description": "...", "pub_date": "2026-03-12", "category": "AI"}],
  "categories": ["AI", "Hardware", "Policy"],
  "latest_article": "Most recent article title",
  "oldest_article": "Oldest article title"
}
```

### Multi-feed briefing → digest.json

When asked for a news briefing, fetch ALL 4 feeds, then produce:

```json
{
  "categories": [
    {
      "name": "Technology",
      "source": "tech",
      "stories": [{"title": "...", "description": "...", "date": "2026-03-12"}],
      "summary": "Overview of tech stories"
    },
    {
      "name": "Business",
      "source": "business",
      "stories": [],
      "summary": "Overview of business stories"
    },
    {
      "name": "World",
      "source": "world",
      "stories": [],
      "summary": "Overview of world stories"
    },
    {
      "name": "Science",
      "source": "science",
      "stories": [],
      "summary": "Overview of science stories"
    }
  ],
  "highlights": [
    {"title": "Story from tech feed", "significance": "Why this matters"},
    {"title": "Story from world feed", "significance": "Why this matters"},
    {"title": "Story from science feed", "significance": "Why this matters"},
    {"title": "Story from business feed", "significance": "Why this matters"}
  ],
  "stats": {"total_stories": 16, "sources_count": 4}
}
```

IMPORTANT:
- `categories` must be an **array** of objects (not a nested object). Each category must have a `name` field.
- Include **every article** from every feed — do not drop or summarize away any articles. Each story from the XML must appear in the stories array for its category.
- The `highlights` array MUST include stories from at least 3 different categories (e.g., one tech highlight, one world highlight, one science highlight, one business highlight). Never select all highlights from the same category.
- Include full article descriptions — do not truncate them.

### Article summary → digest.json

When given articles to summarize:
```json
{
  "article_count": 5,
  "date_range": {"earliest": "2026-03-08", "latest": "2026-03-11"},
  "summaries": [{"title": "...", "source": "...", "one_line_summary": "Max 20 words", "topic": "Energy"}],
  "key_numbers": [{"value": "5 megajoules", "context": "Energy produced by fusion reaction"}],
  "top_story": "Most significant article title"
}
```

## Best Practices

- Fetch feeds individually or in parallel to avoid timeouts — never all in one blocking script
- Use Python xml.etree for reliable XML parsing (not grep/sed)
- Convert dates to ISO 8601 (YYYY-MM-DD)
- Sort categories alphabetically when listing unique categories
- Extract ALL statistics/numbers from articles for key_numbers
- Keep one_line_summary under 20 words
