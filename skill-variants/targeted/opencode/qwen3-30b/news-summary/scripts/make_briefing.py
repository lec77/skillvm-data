"""Parse multiple RSS feed XML files and create a categorized news digest."""
import xml.etree.ElementTree as ET
import json
import sys

def parse_feed(filename, category_name):
    tree = ET.parse(filename)
    channel = tree.getroot().find('channel')
    source_el = channel.find('title')
    source = source_el.text if source_el is not None else category_name
    articles = []
    for item in channel.findall('item'):
        title_el = item.find('title')
        desc_el = item.find('description')
        pub_el = item.find('pubDate')
        articles.append({
            'title': title_el.text if title_el is not None else '',
            'description': desc_el.text if desc_el is not None else '',
            'pub_date': pub_el.text if pub_el is not None else ''
        })
    titles = [a['title'] for a in articles]
    summary = category_name + ' news: ' + '; '.join(titles) + '.'
    return {
        'name': category_name,
        'source': source,
        'summary': summary,
        'articles': articles
    }

def main():
    categories = [
        parse_feed('feed_tech.xml', 'Technology'),
        parse_feed('feed_biz.xml', 'Business'),
        parse_feed('feed_world.xml', 'World'),
        parse_feed('feed_sci.xml', 'Science'),
    ]

    highlights = []
    for cat in categories:
        if cat['articles']:
            a = cat['articles'][0]
            highlights.append(a['title'] + ': ' + a['description'][:100])

    result = {
        'categories': categories,
        'highlights': highlights
    }

    with open('digest.json', 'w') as f:
        json.dump(result, f, indent=2)

    print('Created digest.json')

if __name__ == '__main__':
    main()
