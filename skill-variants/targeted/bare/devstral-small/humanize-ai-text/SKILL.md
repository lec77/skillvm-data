---
name: humanize-ai-text
description: Detect and rewrite AI-generated text to sound human. Identifies AI patterns (filler phrases, buzzwords, chatbot artifacts) and rewrites text with plain, natural language.
allowed-tools:
  - Read
  - Write
  - StrReplace
  - Glob
---

# Humanize AI Text

Detect AI-generated patterns in text and rewrite to sound natural and human-written.

## AI Pattern Categories

### Filler Phrases
Remove these — they add nothing:
- "It's important to note", "It's worth noting", "It is worth noting"
- "Furthermore", "Additionally", "Moreover"
- "In order to" → "to"
- "Due to the fact that" → "because"

### AI Vocabulary (Buzzwords)
Replace with plain words:
- delve/delving → explore/look into
- tapestry → mix/collection
- landscape → field/area
- leveraging → using
- paramount → important/key
- robust → strong/solid
- synergy → teamwork/cooperation
- holistic → complete/full
- multifaceted → complex/varied
- nuanced → subtle/detailed
- pivotal → key/important
- harnessing → using
- fostering → building/encouraging
- seamless → smooth
- comprehensive → thorough/full

### Chatbot Artifacts
Remove entirely any sentence containing:
- "As an AI language model"
- "I hope this helps"
- "Great question!"
- "I don't have personal opinions"

### Promotional Language
Replace with neutral terms:
- cutting-edge → modern/new
- groundbreaking → new/notable
- revolutionize → change/improve
- transformative → significant
- breathtaking → impressive

## Detection Report Format

When analyzing text for AI patterns, produce a JSON report:
```json
{
  "paragraph_count": <count text blocks separated by blank lines>,
  "patterns_found": [
    {
      "pattern_name": "filler_phrases",
      "description": "Unnecessary filler phrases typical of AI",
      "examples": ["It's important to note", "Furthermore"]
    },
    {
      "pattern_name": "ai_vocabulary",
      "description": "AI-typical buzzwords",
      "examples": ["landscape", "leveraging", "robust"]
    },
    {
      "pattern_name": "chatbot_artifacts",
      "description": "Phrases revealing AI origin",
      "examples": ["As an AI language model"]
    },
    {
      "pattern_name": "promotional_language",
      "description": "Exaggerated promotional terms",
      "examples": ["cutting-edge", "groundbreaking"]
    }
  ],
  "ai_probability": 0.95,
  "total_pattern_count": <total number of individual pattern instances>
}
```

MANDATORY: To count paragraphs, ALWAYS run this command first (replace FILE with actual filename):
```
python3 -c "text=open('FILE').read(); paras=[p.strip() for p in text.split('\n\n') if p.strip()]; print(len(paras))"
```
Use the number returned by this command as paragraph_count. Do NOT count paragraphs manually.

## Rewriting Guidelines

When rewriting AI text to sound human:
1. Read the source text carefully
2. Remove all filler phrases listed above
3. Replace all buzzwords with plain alternatives
4. Remove chatbot artifact sentences entirely
5. Use shorter, direct sentences
6. Keep the same core meaning and topics
7. Stay within 50-200 words for short texts
8. Write a changes_summary.json tracking what was removed
