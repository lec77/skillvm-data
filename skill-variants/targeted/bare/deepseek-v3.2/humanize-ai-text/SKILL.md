---
name: humanize-ai-text
description: Detect and rewrite AI-generated text patterns. Identifies filler phrases, AI vocabulary, chatbot artifacts, and promotional language, then rewrites text to sound natural and human-written.
allowed-tools:
  - Read
  - Write
  - StrReplace
  - Glob
---

# Humanize AI Text

Detect AI writing patterns and rewrite text to sound human. Use Read to load input files, analyze patterns, then Write output files.

## AI Pattern Categories

### Filler Phrases
- "It's important to note", "It is worth noting", "Furthermore", "Additionally", "In order to", "Due to the fact that", "It should be noted that", "Delving into"

### AI Vocabulary (Buzzwords)
- delve, delving, tapestry, landscape, leveraging, cutting-edge, paramount, synergy, robust, multifaceted, holistic, nuanced, pivotal, foster, underscore, comprehensive, seamless, harnessing, revolutionary, transformative, paradigm, ecosystem

### Chatbot Artifacts
- "As an AI language model", "I hope this helps", "Great question!", "I don't have personal opinions"

### Promotional Language
- groundbreaking, cutting-edge, revolutionize, transformative, vibrant, breathtaking, nestled, bustling

### Significance Inflation
- "serves as a testament", "pivotal moment", "indelible mark", "cannot be overstated"

## Task: Detect AI Patterns

When asked to detect/analyze AI patterns in a file:

1. Read the input file
2. Count paragraphs (separated by blank lines)
3. Find all AI pattern instances organized by category
4. Write `detection_report.json`:

```json
{
  "paragraph_count": 4,
  "patterns_found": [
    {
      "pattern_name": "filler_phrases",
      "description": "Common AI filler and transition phrases",
      "examples": ["It's important to note", "Furthermore", "It's worth noting"]
    },
    {
      "pattern_name": "ai_vocabulary",
      "description": "Words and phrases overused by AI models",
      "examples": ["landscape", "leveraging", "cutting-edge", "paramount", "synergy", "robust", "delving", "tapestry", "multifaceted", "holistic", "nuanced"]
    },
    {
      "pattern_name": "chatbot_artifacts",
      "description": "Phrases revealing chatbot origin",
      "examples": ["As an AI language model"]
    },
    {
      "pattern_name": "promotional_language",
      "description": "Exaggerated marketing-style language",
      "examples": ["cutting-edge", "groundbreaking", "revolutionize", "transformative"]
    }
  ],
  "ai_probability": 0.95,
  "total_pattern_count": 25
}
```

Rules:
- `patterns_found` must have at least 4 categories: filler_phrases, ai_vocabulary, chatbot_artifacts, promotional_language
- `examples` must contain the exact phrases found in the text (case-preserved)
- `ai_probability` should be 0.0-1.0 (most AI text scores >0.8)
- `total_pattern_count` = total individual pattern instances across all categories

## Task: Rewrite AI Text

When asked to rewrite/humanize AI text:

1. Read the source file
2. Count original words
3. Rewrite removing ALL AI patterns:
   - Remove filler phrases entirely or replace with natural alternatives
   - Replace buzzwords with plain words (leveraging→using, paramount→important, robust→strong, holistic→complete, multifaceted→complex, nuanced→subtle, pivotal→key, seamless→smooth, synergy→teamwork, cutting-edge→modern, comprehensive→full, ecosystem→system, delving→looking)
   - Remove chatbot artifact sentences entirely
   - Replace promotional language with plain descriptions
   - Use shorter, more direct sentences
4. Preserve core meaning and topic
5. Keep word count within 50-200% of original

Write two files:

**rewritten.txt** — The humanized text (no AI patterns, natural voice)

**changes_summary.json**:
```json
{
  "original_word_count": 103,
  "rewritten_word_count": 85,
  "patterns_removed": [
    "It's important to note",
    "leveraging",
    "cutting-edge",
    "paramount",
    "Furthermore",
    "robust",
    "comprehensive",
    "seamless",
    "Delving into",
    "multifaceted",
    "holistic",
    "nuanced",
    "pivotal"
  ],
  "readability_improved": true
}
```

Rules:
- `patterns_removed` must list at least 5 specific AI phrases/words that were eliminated
- `readability_improved` must be `true`
- `original_word_count` must match actual word count of source (typically 80-130)
- The rewritten text must still mention the core topic (e.g., "remote", "team", "communication")
