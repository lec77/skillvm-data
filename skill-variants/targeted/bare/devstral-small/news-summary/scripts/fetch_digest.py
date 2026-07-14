#!/usr/bin/env python3
"""Fetch multiple RSS feeds, categorize articles, and create digest.json.

Usage:
  python3 fetch_digest.py URL1 URL2 URL3 URL4

Fetches 4 RSS feeds (tech, business, world, science), parses them,
and writes digest.json with categorized articles and highlights.
"""
import sys, json, urllib.request
from xml.etree import ElementTree as ET

CATEGORY_NAMES = ["Tech", "Business", "World", "Science"]

def fetch_feed(url):
    """Fetch and parse an RSS feed URL."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            xml_data = resp.read().decode("utf-8")
        return xml_data
    except Exception as e:
        print(f"Error fetching {url}: {e}", file=sys.stderr)
        return None

def parse_feed(xml_data):
    """Parse RSS XML and return feed info and articles."""
    root = ET.fromstring(xml_data)
    channel = root.find("channel")
    if channel is None:
        return None, []

    feed_title = (channel.findtext("title") or "").strip()
    articles = []
    for item in channel.findall("item"):
        articles.append({
            "title": (item.findtext("title") or "").strip(),
            "description": (item.findtext("description") or "").strip(),
            "category": (item.findtext("category") or "").strip(),
        })
    return feed_title, articles

def pick_highlights(all_categories):
    """Pick top 5 highlights from across all categories."""
    highlights = []
    # Take 1-2 from each category to ensure cross-feed coverage
    for cat in all_categories:
        if cat["articles"]:
            art = cat["articles"][0]
            highlights.append({
                "title": art["title"],
                "source": cat["source"],
                "summary": art["description"][:200]
            })
    # Fill up to 5
    for cat in all_categories:
        for art in cat["articles"][1:]:
            if len(highlights) >= 5:
                break
            highlights.append({
                "title": art["title"],
                "source": cat["source"],
                "summary": art["description"][:200]
            })
        if len(highlights) >= 5:
            break
    return highlights[:5]

def make_summary(articles, cat_name):
    """Generate a brief summary for a category."""
    topics = [a["title"] for a in articles]
    if not topics:
        return f"No articles in {cat_name} category."
    topic_list = ", ".join(topics[:3])
    return f"Key {cat_name.lower()} stories covering {topic_list}."

def main():
    if len(sys.argv) < 5:
        print("Usage: python3 fetch_digest.py TECH_URL BIZ_URL WORLD_URL SCI_URL", file=sys.stderr)
        sys.exit(1)

    urls = sys.argv[1:5]
    categories = []

    for i, url in enumerate(urls):
        cat_name = CATEGORY_NAMES[i]
        xml_data = fetch_feed(url)
        if xml_data is None:
            categories.append({
                "name": cat_name,
                "source": cat_name,
                "summary": f"Failed to fetch {cat_name} feed.",
                "articles": []
            })
            continue

        feed_title, articles = parse_feed(xml_data)
        categories.append({
            "name": cat_name,
            "source": feed_title or cat_name,
            "summary": make_summary(articles, cat_name),
            "articles": articles
        })

    highlights = pick_highlights(categories)

    digest = {
        "categories": categories,
        "highlights": highlights
    }

    with open("digest.json", "w") as f:
        json.dump(digest, f, indent=2)

    print(f"Created digest.json with {sum(len(c['articles']) for c in categories)} articles across {len(categories)} categories and {len(highlights)} highlights.")

if __name__ == "__main__":
    main()
