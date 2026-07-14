---
name: humanize-ai-text
description: Rewrite AI-generated text to sound human. Detect and remove AI patterns like filler phrases, buzzwords, chatbot artifacts, and promotional language.
allowed-tools:
  - Read
  - Write
  - StrReplace
  - Glob
---

# Humanize AI Text

Detect AI patterns in text and rewrite to sound human-written.

## IMPORTANT: Writing JSON files

When using the Write tool to create JSON files, the `content` parameter MUST be a string, not an object. Always serialize JSON to a string first:
- CORRECT: `content: "{\"key\": \"value\"}"`
- WRONG: `content: {"key": "value"}`

## IMPORTANT: Counting words accurately

When reporting word counts, count EVERY word by splitting on whitespace. Do NOT estimate or guess. A two-paragraph text with 6 sentences typically has 80-100 words total, not 50-75. Count each word including small words like "a", "the", "is", "of", "to", "in", "for", "and", "that". Contractions like "It's" and "today's" each count as one word. Hyphenated words like "cutting-edge" count as one word.

## AI Pattern Categories

### Critical (immediate detection)
- **Citation bugs**: `oaicite`, `turn0search`, `contentReference`
- **Chatbot artifacts**: "I hope this helps", "As an AI", "Great question!"
- **Markdown in prose**: `**bold**`, `## headers`

### High signal
- **AI vocabulary**: delve, tapestry, landscape, pivotal, underscore, foster, leverage, harness, paramount, robust, synergy, holistic, multifaceted, nuanced, seamless, comprehensive
- **Significance inflation**: "serves as a testament", "pivotal moment", "indelible mark"
- **Promotional language**: vibrant, groundbreaking, cutting-edge, revolutionize, transformative, breathtaking

### Medium signal
- **Filler phrases**: "It's important to note", "It's worth noting", "furthermore", "in order to", "due to the fact that"
- **Copula avoidance**: "serves as" → "is", "boasts" → "has"
- **Vague attributions**: "experts believe", "industry reports suggest"

## How to Rewrite

1. Read the source text
2. Remove filler phrases entirely
3. Replace AI buzzwords with plain words (leverage→use, paramount→important, robust→strong, holistic→complete, nuanced→detailed, pivotal→key, seamless→smooth, multifaceted→complex, synergy→teamwork)
4. Shorten sentences — break long compound sentences
5. Keep the same meaning and topics
6. Keep similar word count (within 50% of original)

## How to Detect

1. Read the text
2. Count paragraphs (separated by blank lines)
3. Scan for patterns in each category above
4. Record exact matching phrases as examples
5. Score ai_probability 0-1 (>0.8 if many patterns found)
6. Count total individual pattern instances
