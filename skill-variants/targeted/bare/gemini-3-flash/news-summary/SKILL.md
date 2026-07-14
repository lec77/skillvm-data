---
name: news-summary
description: Parse, extract, and summarize news from RSS/XML feeds into structured JSON. Use when working with RSS feeds, news articles, creating news digests, or parsing XML feeds.
---

# News Summary

Parse RSS/XML feeds and summarize news into structured data.

## RSS Feeds — Fetch ALL 4 Concurrently

IMPORTANT: Always fetch ALL 4 feeds. Use background processes to fetch in parallel (feeds may be slow):

```bash
# Fetch all 4 feeds concurrently using background processes
curl -s "https://feeds.bbci.co.uk/news/technology/rss.xml" -o /tmp/tech.xml &
curl -s "https://feeds.bbci.co.uk/news/business/rss.xml" -o /tmp/business.xml &
curl -s "https://feeds.bbci.co.uk/news/world/rss.xml" -o /tmp/world.xml &
curl -s "https://feeds.bbci.co.uk/news/rss.xml" -o /tmp/science.xml &
wait
```

All 4 categories must appear in output: **Technology, Business, World, Science**.

## Parsing RSS XML

Use Python `xml.etree.ElementTree` for reliable parsing — never use grep/sed on XML:

```python
import xml.etree.ElementTree as ET
import json
from datetime import datetime

tree = ET.parse('feed.xml')
root = tree.getroot()
channel = root.find('channel')

feed_title = channel.find('title').text
feed_description = channel.find('description').text

articles = []
for item in channel.findall('item'):
    pub_date_str = item.find('pubDate').text
    dt = datetime.strptime(pub_date_str, '%a, %d %b %Y %H:%M:%S %Z')
    articles.append({
        'title': item.find('title').text,
        'link': item.find('link').text,
        'description': item.find('description').text,
        'pub_date': dt.strftime('%Y-%m-%d'),
        'category': item.find('category').text if item.find('category') is not None else '',
        '_sort_key': dt  # keep full datetime for sorting
    })

# Sort by date for latest/oldest
articles.sort(key=lambda a: a['_sort_key'])
latest = articles[-1]['title']
oldest = articles[0]['title']

# Remove sort keys before output
for a in articles:
    del a['_sort_key']

categories = sorted(set(a['category'] for a in articles if a['category']))
```

## Building a News Digest

When creating a digest from multiple feeds or article collections:

1. **Extract ALL articles** from every feed — include all items, not just a selection
2. **Group by category** (Technology, Business, World, Science, etc.)
3. **Summarize each article** in one line (under 20 words)
4. **Extract key numbers** — scan every article for statistics (percentages, dollar amounts, counts, measurements). Each number needs a `value` (string) and `context` (what it refers to). Extract at least 8.
5. **Select top story** by editorial judgment: novelty, impact scope, long-term significance
6. **Create highlights** array — select 4-6 most significant stories spanning multiple categories

### JSON Output Structure

For news digests, use this structure with a `highlights` key:

```json
{
  "categories": [
    {
      "name": "Technology",
      "articles": [
        {"title": "...", "summary": "..."}
      ]
    }
  ],
  "highlights": [
    "Key story 1 from tech category",
    "Key story 2 from business category",
    "Key story 3 from world category",
    "Key story 4 from science category"
  ]
}
```

The `highlights` array MUST reference stories from at least 2 different categories.
