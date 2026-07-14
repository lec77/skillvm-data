---
name: news-summary
description: ALWAYS load this skill for ANY task involving news, RSS feeds, or article summaries. Contains RSS feed URLs to fetch (https://feeds.bbci.co.uk/news/technology/rss.xml and https://feeds.bbci.co.uk/news/business/rss.xml and https://feeds.bbci.co.uk/news/world/rss.xml and https://feeds.bbci.co.uk/news/rss.xml), XML parsing scripts, and JSON output templates. You MUST load this skill before starting any news-related task.
---

# News Summary

IMPORTANT: This skill provides bundled scripts. Use them instead of writing your own code.

## RSS Feed URLs

```
https://feeds.bbci.co.uk/news/technology/rss.xml
https://feeds.bbci.co.uk/news/business/rss.xml
https://feeds.bbci.co.uk/news/world/rss.xml
https://feeds.bbci.co.uk/news/rss.xml
```

## Quick Reference: Which Script To Use

| Task | Command |
|------|---------|
| Parse local XML file | `python3 scripts/parse_rss.py feed.xml > articles.json` |
| Fetch feeds + create digest | `python3 scripts/fetch_digest.py "URL1" "URL2" "URL3" "URL4"` |
| Summarize articles | Read input, write digest.json manually (see template below) |

## Parse RSS XML → articles.json

Run this ONE command:
```bash
python3 scripts/parse_rss.py feed.xml > articles.json
```

Output structure:
```json
{
  "feed_title": "Channel Title",
  "feed_description": "Channel description text",
  "article_count": 6,
  "articles": [
    {"title": "...", "link": "...", "description": "...", "pub_date": "2026-03-12", "category": "AI"}
  ],
  "categories": ["AI", "Hardware", "Policy"],
  "latest_article": "Title of most recent article",
  "oldest_article": "Title of oldest article"
}
```

Rules: pub_date=YYYY-MM-DD, categories sorted alphabetically, latest/oldest by date.

## Fetch Multiple Feeds → digest.json

Run this ONE command with all 4 feed URLs:
```bash
python3 scripts/fetch_digest.py "https://feeds.bbci.co.uk/news/technology/rss.xml" "https://feeds.bbci.co.uk/news/business/rss.xml" "https://feeds.bbci.co.uk/news/world/rss.xml" "https://feeds.bbci.co.uk/news/rss.xml"
```

This fetches all feeds, parses them, categorizes articles into Tech/Business/World/Science, picks highlights from multiple feeds, and writes digest.json automatically.

## Summarize Articles → digest.json

Read the input JSON file. Write digest.json with this structure:
```json
{
  "article_count": 5,
  "date_range": {"earliest": "2026-03-08", "latest": "2026-03-11"},
  "summaries": [
    {"title": "Exact Title", "source": "Exact Source", "one_line_summary": "Under 20 words", "topic": "Energy"}
  ],
  "key_numbers": [
    {"value": "5 megajoules", "context": "energy produced by fusion reaction"}
  ],
  "top_story": "Exact Title of Most Significant Story"
}
```

Rules:
- title and source MUST match input exactly
- one_line_summary MUST be under 20 words
- topic MUST be one of: Energy, Technology, Transportation, Business
- key_numbers MUST have at least 8 entries — extract ALL numbers from ALL articles
- top_story MUST be exact title from input

Topic assignment:
- fusion/solar/battery/energy/charging/Wh → Energy
- chip/AI/software/computing → Technology
- vehicle/autonomous/ride/EV/driving → Transportation
- company/stock/job/remote work/cost → Business
