---
name: humanize-ai-text
description: Detect and rewrite AI-generated text to sound natural and human-written. Use when asked to humanize, rewrite, or clean up text that sounds robotic, AI-generated, or overly formal. Also use when asked to detect or analyze AI writing patterns, check if text sounds like AI, or identify AI tells in writing.
allowed-tools:
  - Read
  - Write
  - StrReplace
  - Glob
---

# Humanize AI Text

Rewrite AI-generated text so it reads like a human wrote it. LLMs produce statistically average text with recognizable patterns.

## AI Pattern Categories

### Critical — Dead giveaways
- **Citation bugs**: `oaicite`, `turn0search`, `contentReference`. Remove entirely.
- **Chatbot artifacts**: "I hope this helps", "Great question!", "As an AI language model", "As an AI", "Feel free to ask". Remove the containing sentence.
- **Markdown in prose**: `**bold**`, `## headers`, code blocks. Strip formatting.

### High Signal — AI Vocabulary
These words are 10-100x overrepresented in AI text vs human text:
delve, delving, tapestry, landscape, pivotal, underscore, foster, nuanced, multifaceted, paramount, leverage, leveraging, robust, holistic, synergy, paradigm, realm, interplay, intricate, testament, enduring, vibrant, harnessing, furthermore, moreover, consequently, subsequently, comprehensive

### High Signal — Promotional Language
groundbreaking, cutting-edge, revolutionary, transformative, state-of-the-art, breathtaking, seamless

### High Signal — Significance Inflation
"serves as a testament", "pivotal moment", "indelible mark", "rich tapestry", "evolving landscape"

### Medium Signal — Filler Phrases
- "It's important to note" → delete
- "It's worth noting" → delete
- "In order to" → "to"
- "Due to the fact that" → "because"
- "Furthermore" / "Moreover" / "Additionally" → delete
- "In today's digital age" → delete

### Style Signal
- Copula avoidance: "serves as" → "is", "boasts" → "has"
- Curly quotes "" '' → straight quotes "" ''
- Em dash overuse
- Rule of three forced triplets

## How to Detect AI Patterns

When asked to analyze/detect AI patterns in text:

1. Read the input file
2. Count paragraphs (separated by blank lines)
3. Scan for patterns in each category above, collecting exact phrases from the text
4. Write a JSON report file with this exact structure:

```json
{
  "paragraph_count": 4,
  "patterns_found": [
    {
      "pattern_name": "filler_phrases",
      "description": "Empty filler phrases typical of AI writing",
      "examples": ["It's important to note", "It's worth noting"]
    },
    {
      "pattern_name": "ai_vocabulary",
      "description": "Words overrepresented in AI text",
      "examples": ["delving", "tapestry", "landscape", "leveraging", "paramount", "robust", "multifaceted", "nuanced", "holistic"]
    },
    {
      "pattern_name": "chatbot_artifacts",
      "description": "Phrases revealing chatbot origin",
      "examples": ["As an AI language model"]
    },
    {
      "pattern_name": "promotional_language",
      "description": "Hype and marketing language typical of AI",
      "examples": ["cutting-edge", "groundbreaking", "revolutionize", "transformative"]
    }
  ],
  "ai_probability": 0.95,
  "total_pattern_count": 18
}
```

Key rules for detection:
- `examples` must contain EXACT phrases found in the source text
- `pattern_name` must use these exact names: `filler_phrases`, `ai_vocabulary`, `chatbot_artifacts`, `promotional_language`
- `ai_probability` should be >0.8 for text with many AI patterns
- `total_pattern_count` = total number of individual pattern instances across all categories

## How to Rewrite AI Text

When asked to rewrite/humanize text:

1. Read the input file and count its words
2. Apply these changes in order:
   - Remove chatbot sentences ("As an AI...")
   - Delete filler phrases ("It's important to note", "Furthermore")
   - Replace AI buzzwords with plain words: "leveraging" → "using", "paramount" → "important", "delving" → "looking at", "holistic" → "complete", "multifaceted" → "complex", "nuanced" → "detailed", "robust" → "strong", "pivotal" → "key", "seamless" → "smooth", "synergy" → "teamwork"
   - Simplify verbs: "serves as" → "is", "utilize" → "use"
   - Break long sentences, vary length
3. Write the rewritten text to the output file
4. Write a changes summary JSON:

```json
{
  "original_word_count": 103,
  "rewritten_word_count": 85,
  "patterns_removed": ["leveraging", "paramount", "delving", "holistic", "multifaceted", "nuanced", "It's important to note", "Furthermore", "synergy", "robust"],
  "readability_improved": true
}
```

Key rules for rewriting:
- Preserve the core meaning and topics of the original text
- Keep word count between 50-200 words
- The `patterns_removed` array must list at least 5 specific AI phrases/words that were eliminated
- Set `readability_improved` to true
