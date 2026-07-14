---
name: humanize-ai-text
description: Humanize AI-generated text to bypass detection. Rewrites AI content to sound natural and pass AI detectors. Based on Wikipedia's "Signs of AI Writing" guide.
allowed-tools:
  - Read
  - Write
  - StrReplace
  - Glob
---

# Humanize AI Text

Detect and transform AI-generated text patterns to make writing sound natural and human.

## AI Pattern Categories

### Critical (Immediate AI Detection)
- **Citation Bugs**: `oaicite`, `turn0search`, `contentReference`
- **Knowledge Cutoff**: "as of my last training", "based on available information"
- **Chatbot Artifacts**: "I hope this helps", "Great question!", "As an AI language model"
- **Markdown in prose**: `**bold**`, `## headers`

### High Signal
- **AI Vocabulary**: delve, tapestry, landscape, pivotal, underscore, foster, leverage, paramount, synergy, robust, holistic, multifaceted, nuanced, seamless, comprehensive, cutting-edge
- **Significance Inflation**: "serves as a testament", "pivotal moment", "indelible mark"
- **Promotional Language**: vibrant, groundbreaking, nestled, breathtaking, transformative
- **Copula Avoidance**: "serves as" → "is", "boasts" → "has"

### Medium Signal
- **Filler Phrases**: "It's important to note", "furthermore", "in order to", "due to the fact that", "it is worth noting", "delving into"
- **Superficial -ing**: "highlighting the importance", "fostering collaboration"
- **Vague Attributions**: "experts believe", "industry reports suggest"

### Style Signal
- **Curly Quotes**: `""` → `""`
- **Em Dash Overuse**: excessive `—`
- **Rule of Three**: forced triplets

## How to Detect

Read the text and identify patterns from each category above. For each pattern found, note the category name, what was found, and specific examples from the text.

Score AI probability 0-1:
- 0.9+ if chatbot artifacts, citation bugs, or knowledge cutoff found
- 0.7-0.9 if heavy AI vocabulary + filler phrases (>10 patterns)
- 0.5-0.7 if moderate patterns (5-10)
- <0.5 if few patterns

## How to Rewrite

1. **Read** the source text carefully
2. **Remove** filler phrases entirely or replace with nothing
3. **Replace** AI buzzwords with plain equivalents:
   - leveraging → using
   - paramount → important/essential
   - synergy → teamwork/cooperation
   - robust → strong/reliable
   - holistic → complete/overall
   - multifaceted → complex/varied
   - nuanced → subtle/detailed
   - pivotal → key/important
   - seamless → smooth
   - comprehensive → full/thorough
   - cutting-edge → modern/new
   - landscape → field/area
   - paradigm → approach/model
   - ecosystem → system/setup
4. **Simplify** sentences — shorter, more direct
5. **Preserve** the core meaning and key topics

## Writing the Changes Summary

When producing a changes_summary.json:
- `original_word_count`: Count the EXACT number of words in the source file. A typical 2-paragraph source text is around 90-100 words, NOT 140+. Count carefully — do not overestimate. When reading a file, ignore line number prefixes (e.g. "1:", "2:") — only count the actual content words.
- `rewritten_word_count`: exact count from your rewritten output
- `patterns_removed`: array of specific AI phrases/words removed (list at least 5-6 items)
- `readability_improved`: set to `true`
