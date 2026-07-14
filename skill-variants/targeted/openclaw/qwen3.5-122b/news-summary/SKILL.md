---
name: news-summary
description: Parse RSS/XML feeds and summarize news articles into structured JSON. Use when working with RSS feeds, news articles, XML parsing, or creating news digests and briefings.
---

# News Summary

Parse RSS/XML feeds and summarize news into structured JSON output.

## RSS Feed Sources

```bash
# Fetch feeds with curl
curl -s "https://feeds.bbci.co.uk/news/world/rss.xml"
curl -s "https://feeds.bbci.co.uk/news/rss.xml"
curl -s "https://feeds.bbci.co.uk/news/business/rss.xml"
curl -s "https://feeds.bbci.co.uk/news/technology/rss.xml"
```

## Parsing RSS/XML

RSS structure: `<rss><channel>` has `<title>`, `<description>`, `<link>`. Each `<item>` has `<title>`, `<link>`, `<description>`, `<pubDate>`, `<category>`.

Use Python `xml.etree.ElementTree` for parsing — never regex or grep on XML. Always preserve exact text from XML elements (especially `<title>`) — never rephrase:

```python
import xml.etree.ElementTree as ET
from datetime import datetime
import json

tree = ET.parse('feed.xml')  # or ET.fromstring(xml_string)
channel = tree.getroot().find('channel')

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
        'category': item.find('category').text,
        '_datetime': dt  # keep for sorting
    })

# Sort by datetime for latest/oldest
articles.sort(key=lambda a: a['_datetime'])
oldest_article = articles[0]['title']
latest_article = articles[-1]['title']

# Unique categories sorted alphabetically
categories = sorted(set(a['category'] for a in articles))

# Remove internal field before output
for a in articles:
    del a['_datetime']

result = {
    'feed_title': feed_title,
    'feed_description': feed_description,
    'article_count': len(articles),
    'articles': articles,
    'categories': categories,
    'latest_article': latest_article,
    'oldest_article': oldest_article
}

with open('articles.json', 'w') as f:
    json.dump(result, f, indent=2)
```

## Summarizing Articles

When creating a digest from article data:

### Structure
```json
{
  "article_count": 5,
  "date_range": {"earliest": "YYYY-MM-DD", "latest": "YYYY-MM-DD"},
  "summaries": [
    {
      "title": "exact article title",
      "source": "source name",
      "one_line_summary": "max 20 words capturing core news",
      "topic": "Energy|Technology|Transportation|Business"
    }
  ],
  "key_numbers": [
    {"value": "5 megajoules", "context": "energy produced by fusion reaction"}
  ],
  "top_story": "exact title of most significant story"
}
```

### Key numbers extraction
Scan EVERY article for ALL quantitative data: percentages, dollar amounts, counts, durations, measurements, ratings. Extract at least 8 numbers minimum. Each needs `value` (string) and `context` (what it refers to). Be thorough — extract every number mentioned.

### One-line summaries
Under 20 words. Focus on what happened and why it matters.

### Topic classification
Use only the allowed categories from the prompt. Map each article to exactly one topic.

### Top story selection
Pick the most significant story by novelty and impact. Breakthroughs outrank incremental updates.

## Multi-Feed News Briefing

When fetching multiple RSS feeds for a briefing:

1. Fetch ALL available feeds in parallel using background processes (feeds may be slow):
```bash
# Fetch all feeds simultaneously — do NOT chain with &&
curl -s "https://feeds.bbci.co.uk/news/technology/rss.xml" -o tech.xml &
curl -s "https://feeds.bbci.co.uk/news/business/rss.xml" -o business.xml &
curl -s "https://feeds.bbci.co.uk/news/world/rss.xml" -o world.xml &
curl -s "https://feeds.bbci.co.uk/news/rss.xml" -o science.xml &
wait
```
2. Parse each XML with Python xml.etree.ElementTree
3. Extract article titles EXACTLY as they appear in `<title>` tags — never rephrase or modify
4. Group articles by category/feed source
5. Create `digest.json` with this structure:

```json
{
  "categories": [
    {
      "name": "Technology",
      "source": "TechWire Daily",
      "summary": "overview of this category's news",
      "articles": [
        {"title": "...", "description": "..."}
      ]
    }
  ],
  "highlights": [
    "Top highlight spanning multiple categories",
    "Another key highlight from different feed"
  ]
}
```

Key requirements:
- Include ALL articles from ALL feeds (don't skip any)
- **CRITICAL: Copy article titles EXACTLY from RSS `<title>` tags — never paraphrase, abbreviate, or reword. For example, if the feed says "CRISPR Gene Therapy Cures Sickle Cell Disease" you must use that exact string**
- The `highlights` array must reference stories from at least 2 different feed categories
- Include per-category summaries with overview text
- Mention specific details: company names, numbers, key facts
