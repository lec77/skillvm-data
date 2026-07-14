---
name: news-summary
description: Parse RSS/XML feeds and summarize news articles into structured JSON. Use when working with RSS feeds, news articles, or creating news digests.
---

# News Summary

Parse RSS/XML feeds and summarize news into structured JSON.

## RSS Feed URLs

Use these URLs to fetch live feeds when no local file is provided:

- Technology: `https://feeds.bbci.co.uk/news/technology/rss.xml`
- Business: `https://feeds.bbci.co.uk/news/business/rss.xml`
- World: `https://feeds.bbci.co.uk/news/world/rss.xml`
- Top stories / Science: `https://feeds.bbci.co.uk/news/rss.xml`

**IMPORTANT**: If a local XML file already exists in the working directory (e.g. `feed.xml`), read it directly. Do NOT download or overwrite it.

## Parsing RSS XML

Always use Python `xml.etree.ElementTree` to parse RSS. Never use grep/sed or feedparser.

```python
import xml.etree.ElementTree as ET
import json

tree = ET.parse('feed.xml')
root = tree.getroot()
channel = root.find('channel')

feed_title = channel.find('title').text
feed_description = channel.find('description').text

articles = []
categories = set()

for item in channel.findall('item'):
    title = item.find('title').text
    link = item.find('link').text
    desc = item.find('description').text
    pub_date_raw = item.find('pubDate').text
    cat = item.find('category')
    category = cat.text if cat is not None else ''

    # Convert RFC 2822 date to YYYY-MM-DD
    from email.utils import parsedate_to_datetime
    dt = parsedate_to_datetime(pub_date_raw)
    pub_date = dt.strftime('%Y-%m-%d')

    articles.append({
        'title': title,
        'link': link,
        'description': desc,
        'pub_date': pub_date,
        'category': category,
        'datetime': dt  # keep for sorting
    })
    if category:
        categories.add(category)

# Sort by datetime descending for latest/oldest
articles.sort(key=lambda a: a['datetime'], reverse=True)
latest_article = articles[0]['title']
oldest_article = articles[-1]['title']

# Remove datetime helper before output
for a in articles:
    del a['datetime']

output = {
    'feed_title': feed_title,
    'feed_description': feed_description,
    'article_count': len(articles),
    'articles': articles,
    'categories': sorted(categories),
    'latest_article': latest_article,
    'oldest_article': oldest_article
}

with open('articles.json', 'w') as f:
    json.dump(output, f, indent=2)
```

Key rules:
- `pub_date` must be YYYY-MM-DD format only (not full ISO datetime)
- `categories` must be sorted alphabetically
- `latest_article` and `oldest_article` are the titles of the newest and oldest articles by date

## Fetching Multiple Feeds

When creating a multi-feed news briefing, fetch ALL 4 categories: technology, business, world, and science/top-stories. Use `curl -s <url>` to fetch each feed, save to temp files, then parse each with the Python XML approach above.

Always fetch all 4 feeds. Structure the digest as:

```json
{
  "categories": [
    {
      "name": "Technology",
      "source": "tech",
      "articles": [...],
      "summary": "..."
    },
    {
      "name": "Business",
      "source": "business",
      "articles": [...],
      "summary": "..."
    },
    {
      "name": "World",
      "source": "world",
      "articles": [...],
      "summary": "..."
    },
    {
      "name": "Science",
      "source": "science",
      "articles": [...],
      "summary": "..."
    }
  ],
  "highlights": [
    "Key story from tech...",
    "Key story from business...",
    "Key story from world...",
    "Key story from science..."
  ]
}
```

The `highlights` array must reference stories from at least 2 different categories.

## Summarizing Articles

When given a JSON file of articles, create a digest with:
- `article_count`: number of articles
- `date_range`: `{"earliest": "YYYY-MM-DD", "latest": "YYYY-MM-DD"}`
- `summaries`: array with `title`, `source`, `one_line_summary` (max 20 words), `topic`
- `key_numbers`: array of `{"value": "...", "context": "..."}` — extract ALL numbers/statistics from every article (aim for 8+)
- `top_story`: title of the most significant story

For key_numbers, scan every sentence of every article for any quantitative data: percentages, dollar amounts, counts, durations, measurements, rankings.
