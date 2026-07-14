---
name: news-summary
description: Parse, extract, and summarize news content from RSS/XML feeds and article collections. Use when working with RSS feeds, news articles, or creating structured news digests — including parsing XML feeds into JSON, extracting article metadata, summarizing stories, or building news briefings.
---

# News Summary

Parse RSS/XML feeds and summarize news article collections into structured data.

## Parsing RSS/XML Feeds

RSS feeds are XML documents with a standard structure: `<rss><channel>` contains feed metadata (`<title>`, `<description>`, `<link>`), and `<item>` elements contain individual articles.

### Extraction approach

Use a proper XML parser — not regex or grep. In Python use `xml.etree.ElementTree`, in Node use a DOM parser or streaming XML library.

Each `<item>` typically has: `<title>`, `<link>`, `<description>`, `<pubDate>`, `<category>`.

### Date handling

RSS dates use RFC 2822 format: `Thu, 12 Mar 2026 07:30:00 GMT`. When converting to ISO 8601 (YYYY-MM-DD), preserve the full datetime internally for accurate sorting — two articles on the same calendar date may have different publication times. Only truncate to YYYY-MM-DD in the final output after determining ordering.

Python pattern:
```python
from datetime import datetime
dt = datetime.strptime(pub_date_str, '%a, %d %b %Y %H:%M:%S %Z')
iso_date = dt.strftime('%Y-%m-%d')  # for output
```

The `%Z` format handles timezone abbreviations like `GMT`. If timezone-aware parsing is needed, use `email.utils.parsedate_to_datetime` which handles RFC 2822 natively.

### Structured output

When building JSON output from a feed, compute derived fields after parsing all items:
- **Unique categories**: collect into a set, then sort alphabetically
- **Latest/oldest article**: compare by full datetime, then output the title
- **Article count**: length of the items array

## Summarizing Article Collections

When creating a news digest from a collection of articles:

### Key numbers extraction

Scan **every single article** for ALL quantitative data — percentages, dollar amounts, counts, durations, measurements, ratios, ratings. Extract at least 2-3 numbers per article. Each number must be an object with `value` (the number as a string) and `context` (a sentence explaining what the number refers to, mentioning the subject domain — e.g., include words like "fusion", "chip", "battery", "autonomous vehicle", "waymo" so the context is self-explanatory). Cast a wide net; extracting 10-15 numbers is better than extracting too few. Aim for at least 8 total.

### Topic classification

Assign each article a topic from a consistent taxonomy. When the prompt specifies allowed topics, use only those. When it doesn't, derive categories from the content (Energy, Technology, Business, Transportation, etc.).

### One-line summaries

Capture the core news value in a single sentence. Focus on what happened and why it matters. Keep under 20 words — this forces prioritization of the most important fact.

### Editorial judgment

When selecting a "top story," weigh: novelty (first-of-its-kind), impact scope (how many people affected), and long-term significance. Breakthroughs and paradigm shifts outrank incremental updates.
