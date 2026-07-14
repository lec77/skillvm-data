"""Parse an RSS/XML feed file and extract structured article data into JSON."""
import xml.etree.ElementTree as ET
import json
import sys
from datetime import datetime

def main():
    input_file = sys.argv[1] if len(sys.argv) > 1 else 'feed.xml'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'articles.json'

    tree = ET.parse(input_file)
    root = tree.getroot()
    channel = root.find('channel')

    feed_title = channel.find('title').text
    feed_description = channel.find('description').text

    articles = []
    for item in channel.findall('item'):
        pub_date_str = item.find('pubDate').text
        dt = datetime.strptime(pub_date_str, '%a, %d %b %Y %H:%M:%S %Z')
        cat_el = item.find('category')
        articles.append({
            'title': item.find('title').text,
            'link': item.find('link').text,
            'description': item.find('description').text,
            'pub_date': dt.strftime('%Y-%m-%d'),
            'category': cat_el.text if cat_el is not None else '',
            '_dt': dt.isoformat()
        })

    sorted_arts = sorted(articles, key=lambda a: a['_dt'])
    latest = sorted_arts[-1]['title']
    oldest = sorted_arts[0]['title']
    categories = sorted(set(a['category'] for a in articles if a['category']))

    for a in articles:
        del a['_dt']

    result = {
        'feed_title': feed_title,
        'feed_description': feed_description,
        'article_count': len(articles),
        'articles': articles,
        'categories': categories,
        'latest_article': latest,
        'oldest_article': oldest
    }

    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)

    print('Created ' + output_file)

if __name__ == '__main__':
    main()
