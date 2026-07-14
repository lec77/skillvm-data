---
name: humanize-ai-text
description: Detect AI patterns in text and rewrite AI-generated text to sound human. Covers detection reporting and text humanization.
---

# Humanize AI Text

## AI Pattern Detection

When asked to detect/analyze AI patterns in text, produce a JSON report with this exact structure:

```json
{
  "paragraph_count": <number of paragraphs separated by blank lines>,
  "patterns_found": [
    {
      "pattern_name": "filler_phrases",
      "description": "Unnecessary filler that pads text",
      "examples": ["It's important to note", "It's worth noting", "Furthermore"]
    },
    {
      "pattern_name": "ai_vocabulary",
      "description": "Words overused by AI models",
      "examples": ["delving", "tapestry", "landscape", "multifaceted", "nuanced"]
    },
    {
      "pattern_name": "chatbot_artifacts",
      "description": "Phrases revealing chatbot origin",
      "examples": ["As an AI language model"]
    },
    {
      "pattern_name": "promotional_language",
      "description": "Hype and marketing speak",
      "examples": ["cutting-edge", "groundbreaking", "revolutionize"]
    }
  ],
  "ai_probability": <0.0-1.0, should be high for AI text>,
  "total_pattern_count": <total individual pattern instances>
}
```

### Patterns to scan for

**Filler phrases**: "It's important to note", "It's worth noting", "Furthermore", "Moreover", "Additionally", "In order to", "Due to the fact that"

**AI vocabulary**: delve, delving, tapestry, landscape, pivotal, underscore, foster, nuanced, multifaceted, holistic, robust, paramount, leveraging, harnessing, synergy, paradigm, realm, intricate, intricacies, comprehensive, encompasses, crucial

**Chatbot artifacts**: "As an AI", "As an AI language model", "I hope this helps", "Great question", "I don't have personal opinions"

**Promotional language**: cutting-edge, groundbreaking, revolutionize, transformative, innovative, state-of-the-art, game-changing, vibrant, breathtaking, stunning

**Significance inflation**: "serves as a testament", "pivotal moment", "indelible mark", "rich tapestry", "evolving landscape"

**Copula avoidance**: "serves as" instead of "is", "boasts" instead of "has"

Count each individual occurrence as a pattern instance for total_pattern_count. Search examples must be exact phrases found in the text.

## Text Rewriting

When asked to rewrite AI text to sound human:

1. **Read** the source file
2. **Remove** these AI patterns:
   - Filler: "It's important to note", "Furthermore", "It is worth noting" → delete or rephrase
   - Buzzwords: leveraging→using, paramount→important/essential, delving→exploring, holistic→complete, multifaceted→complex, nuanced→subtle, pivotal→key, seamless→smooth, synergy→teamwork, robust→strong
   - Chatbot phrases: remove entire sentences containing "As an AI"
3. **Use** shorter, direct sentences
4. **Preserve** the core meaning and topic
5. **Keep** similar length (within 50% of original word count)

### Output files

**rewritten.txt**: The humanized text (no AI buzzwords, no filler phrases, plain language)

**changes_summary.json**:
```json
{
  "original_word_count": <count words in source>,
  "rewritten_word_count": <count words in rewritten>,
  "patterns_removed": ["leveraging", "paramount", "Furthermore", "delving", "holistic", ...],
  "readability_improved": true
}
```

The patterns_removed array must list at least 5 specific AI words/phrases that were eliminated.
