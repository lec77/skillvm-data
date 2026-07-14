---
name: humanize-ai-text
description: Detect and rewrite AI-generated text to sound human. Identifies AI patterns (filler phrases, AI vocabulary, chatbot artifacts, promotional language) and rewrites text with plain language replacements.
allowed-tools:
  - Read
  - Write
  - StrReplace
  - Glob
---

# Humanize AI Text

Detect and rewrite AI-generated text based on Wikipedia's "Signs of AI Writing" patterns.

## CRITICAL RULES

**Rule 1 — Paragraph counting algorithm:**
1. Split the text on double-newlines (`\n\n`)
2. Filter out any empty/whitespace-only results
3. Count the remaining non-empty blocks
4. Example: "AAA\n\nBBB\n\nCCC\n\nDDD\n" → split gives ["AAA", "BBB", "CCC", "DDD", ""] → filter empty → 4 paragraphs
5. A trailing `\n` or `\n\n` does NOT add a paragraph

**Rule 2 — Word counting:** Count words per sentence, then sum. For 2 short paragraphs, expect 80-120 words total.

**Rule 3 — JSON writing:** Always write JSON as a **string**, never as an object. The write tool requires `content` to be a string.

## AI Pattern Categories

### Filler Phrases (remove or simplify)
- "It's important to note" → remove
- "It's worth noting" → remove
- "Furthermore" → remove or replace with "Also"
- "Moreover" → remove
- "In order to" → "to"
- "Due to the fact that" → "because"
- "Additionally" → remove or "Also"
- "In addition" → remove

### AI Vocabulary (replace with plain words)
| AI Word | Plain Replacement |
|---------|-------------------|
| leveraging | using |
| paramount | important / crucial |
| synergy | teamwork / cooperation |
| robust | strong / solid |
| holistic | comprehensive / complete |
| multifaceted | complex / varied |
| nuanced | subtle / detailed |
| pivotal | key / important |
| seamless | smooth |
| delving | exploring / looking into |
| landscape | field / area |
| tapestry | mix / combination |
| harnessing | using |
| fostering | building / encouraging |
| encompasses | includes / covers |
| paradigms | methods / approaches |
| navigating | handling / dealing with |
| intricacies | details |
| comprehensive | thorough / complete |
| ecosystem | system / environment |

### Chatbot Artifacts (remove entire sentence)
- "As an AI language model"
- "As an AI"
- "I hope this helps"
- "Great question!"

### Promotional Language (replace with neutral terms)
| Promotional | Neutral |
|-------------|---------|
| cutting-edge | modern / advanced |
| groundbreaking | innovative / new |
| revolutionize | change / improve |
| transformative | significant / major |
| breathtaking | impressive |
| vibrant | active / lively |

## Detection Report Format

When creating a detection report, output JSON with:
```json
{
  "paragraph_count": 4,
  "patterns_found": [
    {
      "pattern_name": "filler_phrases",
      "description": "Phrases that pad text without adding meaning",
      "examples": ["It's important to note", "Furthermore"]
    },
    {
      "pattern_name": "ai_vocabulary",
      "description": "Words statistically overused by AI",
      "examples": ["landscape", "leveraging", "robust"]
    },
    {
      "pattern_name": "chatbot_artifacts",
      "description": "Phrases revealing AI origin",
      "examples": ["As an AI language model"]
    },
    {
      "pattern_name": "promotional_language",
      "description": "Overly enthusiastic marketing-like terms",
      "examples": ["cutting-edge", "groundbreaking"]
    }
  ],
  "ai_probability": 0.95,
  "total_pattern_count": 20
}
```

## Rewriting Workflow

1. Read the source text
2. Count original words accurately (split on whitespace)
3. Apply all replacements from the tables above
4. Remove filler phrases and chatbot artifact sentences
5. Break long compound sentences into shorter ones
6. Write rewritten text
7. Write changes summary with accurate word counts

## AI Probability Scoring

| Score | When |
|-------|------|
| 0.9-1.0 | Chatbot artifacts or citation bugs present |
| 0.8-0.9 | Many AI vocabulary words + filler phrases |
| 0.5-0.8 | Some AI patterns but could be human |
| 0.0-0.5 | Few or no AI patterns |
