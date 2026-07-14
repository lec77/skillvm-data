---
name: news-summary
description: Parse, extract, and summarize news from RSS/XML feeds into structured JSON. Use when working with RSS feeds, news articles, creating news digests, or parsing XML feeds.
---

# News Summary

Parse RSS/XML feeds and summarize news into structured JSON.

## CRITICAL RULES

1. **Local files first**: If a local file exists (feed.xml, stories.json), read it directly. Never fetch remote URLs when local data exists.
2. **Use Python scripts**: Always write and run Python scripts for XML parsing and JSON creation. Never use grep/sed/awk for structured data.
3. **Output JSON files**: Write output to the working directory using Python's `json.dump` with `indent=2`.
4. **Dates as YYYY-MM-DD**: All dates must be ISO 8601 format (e.g., "2026-03-12").

## Task: Parse RSS Feed → articles.json

When asked to parse an RSS/XML feed:

```python
import xml.etree.ElementTree as ET
import json
from datetime import datetime

tree = ET.parse("feed.xml")
root = tree.getroot()
channel = root.find("channel")

feed_title = channel.findtext("title", "")
feed_description = channel.findtext("description", "")

articles = []
categories = set()
for item in channel.findall("item"):
    pub_date_str = item.findtext("pubDate", "")
    try:
        dt = datetime.strptime(pub_date_str, "%a, %d %b %Y %H:%M:%S %Z")
    except ValueError:
        dt = datetime.strptime(pub_date_str.rsplit(" ", 1)[0], "%a, %d %b %Y %H:%M:%S")
    cat = item.findtext("category", "Uncategorized")
    categories.add(cat)
    articles.append({
        "title": item.findtext("title", ""),
        "link": item.findtext("link", ""),
        "description": item.findtext("description", ""),
        "pub_date": dt.strftime("%Y-%m-%d"),
        "category": cat,
        "_dt": dt
    })

latest = max(articles, key=lambda a: a["_dt"])["title"]
oldest = min(articles, key=lambda a: a["_dt"])["title"]
for a in articles:
    del a["_dt"]

result = {
    "feed_title": feed_title,
    "feed_description": feed_description,
    "article_count": len(articles),
    "articles": articles,
    "categories": sorted(categories),
    "latest_article": latest,
    "oldest_article": oldest
}
with open("articles.json", "w") as f:
    json.dump(result, f, indent=2)
```

Rules:
- `categories`: sorted alphabetically, unique values
- `latest_article` / `oldest_article`: determined by full datetime comparison, store the TITLE string
- `pub_date`: MUST be YYYY-MM-DD format

## Task: Summarize Articles → digest.json

When given a JSON file with articles:

```python
import json

with open("stories.json") as f:
    stories = json.load(f)

topic_map = {
    "fusion": "Energy", "energy": "Energy", "battery": "Energy", "solar": "Energy",
    "chip": "Technology", "semiconductor": "Technology", "ai": "Technology", "software": "Technology",
    "vehicle": "Transportation", "autonomous": "Transportation", "car": "Transportation", "waymo": "Transportation",
    "work": "Business", "market": "Business", "remote": "Business", "company": "Business"
}

def get_topic(article):
    text = (article.get("title","") + " " + article.get("body","")).lower()
    for keyword, topic in topic_map.items():
        if keyword in text:
            return topic
    return "Technology"

dates = []
summaries = []
key_numbers = []

for article in stories:
    dates.append(article.get("date", ""))
    summaries.append({
        "title": article["title"],
        "source": article.get("source", ""),
        "one_line_summary": "GENERATE_UNDER_20_WORDS",
        "topic": get_topic(article)
    })
    # Extract ALL numbers from body: percentages, dollar amounts, measurements, counts
    # Each as {"value": "5 megajoules", "context": "what it refers to"}

dates_sorted = sorted(dates)
digest = {
    "article_count": len(stories),
    "date_range": {"earliest": dates_sorted[0], "latest": dates_sorted[-1]},
    "summaries": summaries,
    "key_numbers": key_numbers,  # at least 8 numbers
    "top_story": "EXACT_TITLE_OF_MOST_SIGNIFICANT_STORY"
}
with open("digest.json", "w") as f:
    json.dump(digest, f, indent=2)
```

Rules:
- `topic` MUST be one of: "Energy", "Technology", "Transportation", "Business"
- `one_line_summary` MUST be under 20 words
- Extract **at least 8** key numbers from ALL articles — every statistic, percentage, dollar amount, quantity, measurement
- `top_story` must be an exact title string from the source articles

## Task: Multi-Feed Digest → digest.json

When asked for a news briefing with multiple feeds, fetch ALL feeds concurrently:

```bash
# Fetch all 4 feeds concurrently (feeds may be slow)
curl -s "URL1" -o /tmp/tech.xml &
curl -s "URL2" -o /tmp/business.xml &
curl -s "URL3" -o /tmp/world.xml &
curl -s "URL4" -o /tmp/science.xml &
wait
```

Then parse with Python:

```python
import xml.etree.ElementTree as ET
import json

feed_files = {
    "Technology": "/tmp/tech.xml",
    "Business": "/tmp/business.xml",
    "World": "/tmp/world.xml",
    "Science": "/tmp/science.xml"
}

categories = []
all_highlights = []

for cat_name, path in feed_files.items():
    tree = ET.parse(path)
    root = tree.getroot()
    channel = root.find("channel")
    articles = []
    for item in channel.findall("item"):
        articles.append({
            "title": item.findtext("title", ""),
            "summary": item.findtext("description", ""),
        })
        all_highlights.append((cat_name, item.findtext("title", "")))
    categories.append({
        "name": cat_name,
        "articles": articles
    })

# Select highlights spanning at least 2 categories
highlights = [title for cat, title in all_highlights[:6]]

digest = {"categories": categories, "highlights": highlights}
with open("digest.json", "w") as f:
    json.dump(digest, f, indent=2)
```

Rules:
- Include ALL articles from ALL feeds — do not skip any
- `highlights` array MUST reference stories from at least 2 different categories
- All 4 categories must appear: Technology, Business, World, Science

## RSS Feed Sources

```
https://feeds.bbci.co.uk/news/technology/rss.xml
https://feeds.bbci.co.uk/news/business/rss.xml
https://feeds.bbci.co.uk/news/world/rss.xml
https://feeds.bbci.co.uk/news/rss.xml
```
