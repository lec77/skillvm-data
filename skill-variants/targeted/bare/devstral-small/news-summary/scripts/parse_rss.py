#!/usr/bin/env python3
"""Parse RSS XML feed(s) and output structured JSON.

Usage:
  python3 parse_rss.py <input.xml> [<input2.xml> ...]

Prints JSON to stdout with feed info and articles array.
For multiple files, prints a JSON array of feed objects.
"""
import sys, json, re
from xml.etree import ElementTree as ET
from datetime import datetime

MONTHS = {"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,
           "Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12}

def parse_rfc822(s):
    """Parse RFC 822 date to ISO 8601 YYYY-MM-DD."""
    try:
        # Format: "Thu, 12 Mar 2026 07:30:00 GMT"
        parts = s.strip().replace(",", "").split()
        if len(parts) >= 5:
            day = int(parts[1])
            month = MONTHS.get(parts[2], 1)
            year = int(parts[3])
            return f"{year:04d}-{month:02d}-{day:02d}"
    except Exception:
        pass
    return s

def parse_feed(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    channel = root.find("channel")
    if channel is None:
        return {"error": "No channel element found"}

    feed_title = (channel.findtext("title") or "").strip()
    feed_desc = (channel.findtext("description") or "").strip()

    articles = []
    for item in channel.findall("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        desc = (item.findtext("description") or "").strip()
        pub_date_raw = (item.findtext("pubDate") or "").strip()
        category = (item.findtext("category") or "").strip()

        pub_date = parse_rfc822(pub_date_raw)
        articles.append({
            "title": title,
            "link": link,
            "description": desc,
            "pub_date": pub_date,
            "category": category
        })

    # Sort by date descending
    articles.sort(key=lambda a: a["pub_date"], reverse=True)

    categories = sorted(set(a["category"] for a in articles if a["category"]))

    latest = articles[0]["title"] if articles else ""
    oldest = articles[-1]["title"] if articles else ""

    return {
        "feed_title": feed_title,
        "feed_description": feed_desc,
        "article_count": len(articles),
        "articles": articles,
        "categories": categories,
        "latest_article": latest,
        "oldest_article": oldest
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 parse_rss.py <file.xml> [<file2.xml> ...]", file=sys.stderr)
        sys.exit(1)

    if len(sys.argv) == 2:
        result = parse_feed(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        results = []
        for f in sys.argv[1:]:
            results.append(parse_feed(f))
        print(json.dumps(results, indent=2))
