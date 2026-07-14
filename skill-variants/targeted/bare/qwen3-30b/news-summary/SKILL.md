---
name: news-summary
description: Use when parsing RSS/XML feeds, summarizing news articles, extracting structured data from articles, or creating news digests. Covers XML-to-JSON conversion, article summarization, key statistics extraction, and multi-feed aggregation.
---

# News Summary Skill

## Core Capabilities

1. **Parse RSS XML** → structured JSON (articles, metadata, categories)
2. **Summarize articles** → digest with summaries, key numbers, editorial picks
3. **Multi-feed digest** → fetch multiple RSS feeds, group by category, create highlights

## Task 1: Parse RSS XML into JSON

### Procedure

1. Read the XML file with `read_file`
2. Write a script that parses XML and outputs JSON
3. Save result as `articles.json`

### Script approach — use `execute_command` to run a Node.js/Bun script:

```bash
bun -e '
const fs = require("fs");
const xml = fs.readFileSync("feed.xml", "utf-8");

// Extract channel title
const chTitle = xml.match(/<channel>[\s\S]*?<title>(.*?)<\/title>/);
const chDesc = xml.match(/<channel>[\s\S]*?<description>(.*?)<\/description>/);

// Extract items
const items = [];
const itemRegex = /<item>([\s\S]*?)<\/item>/g;
let m;
while ((m = itemRegex.exec(xml)) !== null) {
  const block = m[1];
  const get = (tag) => { const r = block.match(new RegExp("<" + tag + ">(.*?)</" + tag + ">")); return r ? r[1] : ""; };
  const rawDate = get("pubDate");
  // Convert "Mon, 15 Mar 2026 09:00:00 GMT" → "2026-03-15"
  const d = new Date(rawDate);
  const iso = d.toISOString().split("T")[0];
  items.push({ title: get("title"), link: get("link"), description: get("description"), pub_date: iso, category: get("category") });
}

// Sort by date descending for latest/oldest
const sorted = [...items].sort((a, b) => b.pub_date.localeCompare(a.pub_date));
const categories = [...new Set(items.map(i => i.category))].filter(Boolean).sort();

const result = {
  feed_title: chTitle ? chTitle[1] : "",
  feed_description: chDesc ? chDesc[1] : "",
  article_count: items.length,
  articles: items,
  categories: categories,
  latest_article: sorted[0]?.title || "",
  oldest_article: sorted[sorted.length - 1]?.title || ""
};

fs.writeFileSync("articles.json", JSON.stringify(result, null, 2));
console.log("Done:", result.article_count, "articles");
'
```

### Output schema for articles.json

```json
{
  "feed_title": "string — channel <title>",
  "feed_description": "string — channel <description>",
  "article_count": 6,
  "articles": [
    {
      "title": "Article Title",
      "link": "https://...",
      "description": "Article description text",
      "pub_date": "2026-03-15",
      "category": "AI"
    }
  ],
  "categories": ["AI", "Hardware", "Policy", "Quantum", "Security", "Space"],
  "latest_article": "Title of most recent by date",
  "oldest_article": "Title of oldest by date"
}
```

**CRITICAL rules:**
- `pub_date` MUST be ISO 8601: `YYYY-MM-DD` (use `new Date(rawDate).toISOString().split("T")[0]`)
- `categories` MUST be sorted alphabetically
- `latest_article` and `oldest_article` are just the title strings, not objects
- `article_count` is a number, not a string

## Task 2: Summarize Articles into Digest

### Procedure

1. Read `stories.json` with `read_file` to understand the articles
2. Use `write_file` to create `digest.json` directly with all required fields
3. ALWAYS write summaries yourself — do NOT try to use a script for summarization
4. For key_numbers: scan EVERY article and extract ALL notable numbers

### Output schema for digest.json

```json
{
  "article_count": 5,
  "date_range": {
    "earliest": "2026-03-08",
    "latest": "2026-03-11"
  },
  "summaries": [
    {
      "title": "Exact title from source",
      "source": "Source name from article",
      "one_line_summary": "Max 20 words summarizing the article",
      "topic": "Energy"
    }
  ],
  "key_numbers": [
    {
      "value": "5 megajoules",
      "context": "Energy output achieved in fusion ignition experiment"
    }
  ],
  "top_story": "Exact title of the most significant story"
}
```

**Topic assignment rules:**
- Fusion, energy → "Energy"
- Chips, semiconductors, software, remote work → "Technology"
- Autonomous vehicles → "Transportation"
- Battery, EV range → "Technology" or "Energy" (either valid)
- Business/financial focus → "Business"
- ONLY use: "Energy", "Technology", "Transportation", "Business"

**Key numbers extraction — VERY IMPORTANT:**
- Extract AT LEAST 10 numbers (more is better) from across ALL articles
- MUST include numbers from EVERY article — fusion, chips, vehicles, batteries, AND remote work
- Look for: percentages, dollar amounts, measurements, counts, timeframes, ratings
- Each entry needs `value` (the number/stat as string) and `context` (what it means)
- Example numbers to look for in each article:
  - Fusion: megajoules, seconds, years to grid
  - Chips: weeks lead time, percentage price drops
  - Vehicles: fleet size, rides completed, wait times, ratings
  - Batteries: Wh/kg, charge time, cycle count, production year
  - Remote work: productivity %, cost reduction %, worker preference %

**CRITICAL rules:**
- `one_line_summary` MUST be 20 words or fewer — write a NEW concise summary, do NOT copy from the article text
- `top_story` MUST be the EXACT title string from the source data
- `date_range.earliest` and `date_range.latest` in YYYY-MM-DD format
- `key_numbers` must have at least 8 entries

## Task 3: Multi-Feed Digest (Fetch + Aggregate)

### Procedure

1. Fetch ALL 4 RSS feed URLs using curl via `execute_command`
2. Parse each feed's XML to extract articles
3. Group articles by source category
4. Write `digest.json`

### Fetching feeds

ALWAYS fetch all 4 feeds. Use curl:

```bash
curl -s http://localhost:PORT/tech
curl -s http://localhost:PORT/business
curl -s http://localhost:PORT/world
curl -s http://localhost:PORT/science
```

### Best approach: write a single Bun script

```bash
bun -e '
const fs = require("fs");

async function fetchFeed(url, category) {
  const resp = await fetch(url);
  const xml = await resp.text();
  const articles = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag) => { const r = block.match(new RegExp("<" + tag + ">([\\s\\S]*?)</" + tag + ">")); return r ? r[1].trim() : ""; };
    articles.push({ title: get("title"), description: get("description") });
  }
  return { source: category, article_count: articles.length, articles: articles };
}

async function main() {
  const base = process.argv[2]; // e.g. http://localhost:12345
  const feeds = await Promise.all([
    fetchFeed(base + "/tech", "tech"),
    fetchFeed(base + "/business", "business"),
    fetchFeed(base + "/world", "world"),
    fetchFeed(base + "/science", "science")
  ]);
  // ... add summaries and overview per category, then highlights
  const result = { categories: feeds, highlights: [] };
  // Add overview/summary to each category
  // Pick top 5 highlights across all feeds
  fs.writeFileSync("digest.json", JSON.stringify(result, null, 2));
}
main();
' URL_HERE
```

### Output schema for digest.json

```json
{
  "categories": [
    {
      "source": "tech",
      "article_count": 4,
      "articles": [
        { "title": "Article Title", "summary": "One-line summary" }
      ],
      "overview": "2-3 sentence summary of this category's themes"
    }
  ],
  "highlights": [
    {
      "title": "Most Significant Story Title",
      "source": "tech",
      "why_it_matters": "One sentence on significance"
    }
  ]
}
```

**CRITICAL rules:**
- MUST fetch ALL 4 feeds — do not skip any
- `categories` array MUST have 4 entries (tech, business, world, science)
- Each category MUST have `source`, `article_count`, `articles` array, and `overview` or `summary`
- `highlights` array MUST have exactly 5 entries from across multiple different categories
- Highlights MUST span at least 2 different source categories (ideally 3-4)
- Use `fetch()` or `curl` — the feeds are HTTP endpoints, NOT local files

## General Rules

- ALWAYS write output as valid JSON using `write_file` or a script with `fs.writeFileSync`
- NEVER use `grep`/`sed` for XML parsing — use a proper script with regex
- ALWAYS verify the output file exists after writing
- Date format is ALWAYS `YYYY-MM-DD`
- Use `bun -e '...'` via `execute_command` for any data processing
