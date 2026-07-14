---
name: news-summary
description: Parse, extract, and summarize news from RSS/XML feeds and article collections. Use when working with RSS feeds, news articles, creating structured news digests, parsing XML into JSON, extracting article metadata, summarizing stories, building news briefings, or fetching multiple feeds.
---

# News Summary

Parse RSS/XML feeds and summarize news articles into structured JSON.

## Bundled Scripts

This skill includes ready-to-run Python scripts in the `scripts/` directory. ALWAYS use these scripts instead of writing code manually.

## Task 1: Parse a Single RSS Feed into JSON

When given an RSS/XML file to parse into structured JSON:

```bash
python3 scripts/parse_rss.py feed.xml articles.json
```

This reads `feed.xml` and creates `articles.json` with: feed_title, feed_description, article_count, articles array (with title, link, description, pub_date in YYYY-MM-DD, category), categories (sorted alphabetically), latest_article, oldest_article.

If the input filename differs, pass it as the first argument. If the output filename differs, pass it as the second argument.

## Task 2: Summarize Article Collections

When given a JSON file with news articles to create a digest:

```bash
python3 scripts/make_digest.py stories.json digest.json
```

This reads the articles and creates `digest.json` with: article_count, date_range (earliest/latest), summaries (title, source, one_line_summary under 20 words, topic from Energy/Technology/Transportation/Business), key_numbers (at least 8 statistics extracted), top_story.

If the input filename differs, pass it as the first argument. If the output filename differs, pass it as the second argument.

## Task 3: Multi-Feed News Briefing

When asked for a news briefing or "what's happening in the world":

### Step 1: Fetch all feeds in parallel
```bash
curl -s "https://feeds.bbci.co.uk/news/technology/rss.xml" -o feed_tech.xml & curl -s "https://feeds.bbci.co.uk/news/business/rss.xml" -o feed_biz.xml & curl -s "https://feeds.bbci.co.uk/news/world/rss.xml" -o feed_world.xml & curl -s "https://feeds.bbci.co.uk/news/rss.xml" -o feed_sci.xml & wait
```

### Step 2: Create the digest
```bash
python3 scripts/make_briefing.py
```

This parses all 4 feed XML files and creates `digest.json` with categories (Technology, Business, World, Science), each containing source, summary, and articles, plus a highlights array spanning multiple categories.

## Key Rules

- ALWAYS use the bundled scripts — do NOT write Python code manually
- NEVER write JSON files directly with the write/edit tool — always use a script
- For RSS parsing, use `xml.etree.ElementTree` (the scripts handle this)
- RSS dates (RFC 2822) are converted to ISO 8601 (YYYY-MM-DD) by the scripts
