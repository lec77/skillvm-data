"""Read a JSON file of news articles and create a structured digest."""
import json
import re
import sys

def classify_topic(title, content):
    text = (title + ' ' + content).lower()
    if 'fusion' in text or 'energy' in text or 'battery' in text or 'power' in text or 'solar' in text:
        return 'Energy'
    if 'autonomous' in text or 'vehicle' in text or 'ev ' in text or 'driving' in text or 'transport' in text:
        return 'Transportation'
    if 'remote work' in text or 'firm' in text or 'companies' in text or 'business' in text or 'market' in text or 'cost' in text or 'productivity' in text:
        return 'Business'
    return 'Technology'

def extract_numbers(content):
    nums = []
    sentences = content.replace('. ', '.\n').split('\n')
    for s in sentences:
        if not re.search(r'\d', s):
            continue
        # Find numeric patterns with units
        patterns = re.findall(
            r'[\$]?[\d,]+(?:\.?\d+)?(?:\s*[-–]\s*[\d,]+(?:\.?\d+)?)?\s*'
            r'(?:megajoules|seconds|weeks|years|percent|%|billion|million|trillion|'
            r'vehicles|rides|minutes|stars|Wh/kg|cycles|workers|nm|hours)',
            s, re.IGNORECASE
        )
        for p in patterns:
            nums.append({'value': p.strip(), 'context': s.strip()[:150]})
        # Catch percentage ranges like "15-20%"
        pct = re.findall(r'\d+[-–]\d+%', s)
        for p in pct:
            if not any(p in n['value'] for n in nums):
                nums.append({'value': p, 'context': s.strip()[:150]})
    return nums

def summarize_short(content, max_words=18):
    words = content.split()
    if len(words) <= max_words:
        return content
    summary = ' '.join(words[:max_words])
    summary = summary.rstrip('.,;:')
    return summary + '.'

def main():
    input_file = sys.argv[1] if len(sys.argv) > 1 else 'stories.json'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'digest.json'

    with open(input_file) as f:
        articles = json.load(f)

    dates = sorted([a['date'] for a in articles])

    summaries = []
    all_numbers = []
    for a in articles:
        topic = classify_topic(a['title'], a['content'])
        one_line = summarize_short(a['content'])
        summaries.append({
            'title': a['title'],
            'source': a['source'],
            'one_line_summary': one_line,
            'topic': topic
        })
        all_numbers.extend(extract_numbers(a['content']))

    result = {
        'article_count': len(articles),
        'date_range': {'earliest': dates[0], 'latest': dates[-1]},
        'summaries': summaries,
        'key_numbers': all_numbers,
        'top_story': articles[0]['title']
    }

    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)

    print('Created ' + output_file)

if __name__ == '__main__':
    main()
