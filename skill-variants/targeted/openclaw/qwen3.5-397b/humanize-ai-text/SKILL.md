---
name: humanize-ai-text
description: Detect and rewrite AI-generated text to sound natural and human-written. Use when asked to humanize, rewrite, or clean up text that sounds robotic, AI-generated, or overly formal. Also use when asked to detect or analyze AI writing patterns, check if text sounds like AI, or identify AI tells in writing.
---

# Humanize AI Text

Detect and rewrite AI-generated text so it reads like a human wrote it.

## AI Pattern Categories

### Critical — Dead giveaways
- **Chatbot artifacts**: "As an AI", "I hope this helps", "Great question!", "Feel free to ask"
- **Citation bugs**: `oaicite`, `turn0search`, `contentReference`
- **Knowledge cutoff**: "as of my last training", "based on available information"
- **Markdown in prose**: `**bold**`, `## headers`, code blocks

### High Signal
- **AI vocabulary**: delve, tapestry, landscape, pivotal, underscore, foster, nuanced, multifaceted, paramount, leverage, robust, holistic, synergy, paradigm, realm, harnessing, furthermore, moreover
- **Significance inflation**: "serves as a testament", "pivotal moment", "rich tapestry", "enduring legacy"
- **Promotional language**: groundbreaking, cutting-edge, revolutionary, transformative, state-of-the-art, vibrant, bustling
- **Copula avoidance**: "serves as" → "is", "boasts a" → "has a"

### Medium Signal
- **Filler phrases**: "It's important to note", "In order to" → "to", "Due to the fact that" → "because", "It is worth noting"
- **Superficial -ing**: "highlighting the importance", "fostering collaboration"
- **Vague attributions**: "experts believe", "industry reports suggest"

### Style Signal
- Curly quotes → straight quotes
- Em dash overuse
- "Not only... but also" parallelisms
- Forced triplets ("innovation, inspiration, and insight")

## Rewriting Strategy

1. **Remove critical artifacts** — delete chatbot sentences, citation bugs, markdown formatting
2. **Simplify verbs** — "leveraging" → "using", "utilize" → "use", "facilitate" → "help"
3. **Cut filler** — remove empty openers ("It's important to note"), transitions ("Furthermore")
4. **Replace AI vocabulary** — "delve" → "look at", "paramount" → "important", "multifaceted" → describe specific facets
5. **Vary sentence length** — AI defaults to uniform medium sentences; mix short and long
6. **Preserve meaning** — same information, more naturally expressed

## Detection Report Format

When analyzing text for AI patterns, output JSON with this exact structure:

```json
{
  "paragraph_count": 4,
  "patterns_found": [
    {
      "pattern_name": "filler_phrases",
      "description": "Empty filler phrases that add no meaning",
      "examples": ["important to note", "worth noting"]
    },
    {
      "pattern_name": "ai_vocabulary",
      "description": "Words statistically overrepresented in AI text",
      "examples": ["delving", "tapestry", "landscape"]
    },
    {
      "pattern_name": "chatbot_artifacts",
      "description": "Phrases revealing chatbot origin",
      "examples": ["As an AI"]
    },
    {
      "pattern_name": "promotional_language",
      "description": "Marketing-style superlatives",
      "examples": ["cutting-edge", "groundbreaking"]
    }
  ],
  "ai_probability": 0.95,
  "total_pattern_count": 15
}
```

Rules for the report:
- `examples` must be exact phrases found in the source text (lowercased substrings are fine)
- `patterns_found` must include at minimum: filler_phrases, ai_vocabulary, chatbot_artifacts, promotional_language
- `ai_probability`: >0.9 if chatbot artifacts present, >0.8 if dense AI vocab, >0.5 if moderate
- `total_pattern_count`: sum of all individual examples across all patterns (must be ≥10 for heavily AI text)

## Rewrite Output Format

When rewriting AI text, produce two files:
1. **rewritten.txt** — the humanized text (preserve core meaning, remove all AI patterns)
2. **changes_summary.json**:
```json
{
  "original_word_count": 107,
  "rewritten_word_count": 85,
  "patterns_removed": ["It's important to note", "leveraging", "paramount", "synergy", "robust", "delving", "multifaceted", "holistic", "nuanced", "pivotal"],
  "readability_improved": true
}
```

Rules for rewrite:
- `original_word_count`: Count words in the source file accurately. Read the file, split by whitespace, count. Do NOT estimate — count precisely. A typical 2-paragraph source is ~90-110 words, not 130+.
- `rewritten_word_count`: actual word count of rewritten text
- `patterns_removed` must list ≥5 specific AI phrases that were eliminated
- `readability_improved` must be `true`
- Rewritten text must keep keywords about the core topic (e.g., "remote", "team", "communication")
- Keep rewritten word count between 50-200 words
