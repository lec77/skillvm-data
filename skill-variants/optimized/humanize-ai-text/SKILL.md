---
name: humanize-ai-text
description: Detect and rewrite AI-generated text to sound natural and human-written. Use when asked to humanize, rewrite, or clean up text that sounds robotic, AI-generated, or overly formal. Also use when asked to detect or analyze AI writing patterns, check if text sounds like AI, or identify AI tells in writing.
---

# Humanize AI Text

Rewrite AI-generated text so it reads like a human wrote it. LLMs produce statistically average text — the most probable next word across all training data. This creates recognizable patterns that readers and detection tools catch.

## Detection Categories

Scan for these patterns, ordered by signal strength:

### Critical — Dead giveaways
- **Citation bugs**: `oaicite`, `turn0search`, `contentReference`, `utm_source=chatgpt`. Remove entirely.
- **Knowledge cutoff**: "as of my last training", "based on available information". Remove the sentence.
- **Chatbot artifacts**: "I hope this helps", "Great question!", "As an AI language model", "Feel free to ask", "Happy to help". Remove the containing sentence.
- **Markdown in prose**: `**bold**`, `## headers`, code blocks. Strip formatting.

### High Signal
**AI vocabulary** — 10-100x overrepresented vs human text:
delve, tapestry, landscape, pivotal, underscore, foster, nuanced, multifaceted, paramount, leverage, robust, holistic, synergy, paradigm, realm, interplay, intricate, garner, testament, enduring, vibrant, harnessing, furthermore, moreover, consequently, subsequently, thereby, wherein, notwithstanding

**Significance inflation**: "serves as a testament", "pivotal moment", "indelible mark", "rich tapestry", "enduring legacy", "evolving landscape", "deeply rooted"

**Promotional language**: groundbreaking, cutting-edge, revolutionary, transformative, state-of-the-art, world-class, breathtaking, stunning, nestled, bustling, renowned

**Copula avoidance** — AI avoids "is/has":
serves as → is | stands as → is | boasts a → has a | represents a → is a | features a → has a

### Medium Signal
**Filler phrases** — delete or replace:
"It's important to note" → *(delete)* | "In order to" → to | "Due to the fact that" → because | "Has the ability to" → can | "Additionally/Furthermore/Moreover," → *(delete)*

**Superficial -ing**: "highlighting the importance", "fostering collaboration" — rewrite as concrete statements or cut.

**Vague attributions**: "experts believe", "industry reports suggest" — cite specifically or remove.

**Challenges formula**: "Despite these challenges", "Looking ahead", "Moving forward" — replace with specific connectors.

### Style Signal
- **Curly quotes**: "" '' → "" '' (ChatGPT Unicode). Use straight quotes.
- **Em dash overuse**: >2-3 per page → replace some with commas/periods.
- **Negative parallelisms**: "Not only... but also" — restructure.
- **Rule of three**: Forced triplets like "innovation, inspiration, and insight" — reduce to what's relevant.

## Rewriting Strategy

Follow this sequence:
1. **Remove critical artifacts** — chatbot sentences, citation bugs, markdown, cutoff phrases
2. **Simplify verbs** — "serves as" → "is", "leveraging" → "using", "utilize" → "use", "facilitate" → "help", "optimize" → "improve"
3. **Cut filler** — empty openers, transitions ("Furthermore"), conclusions ("In conclusion")
4. **Replace AI vocabulary** — "delve" → "look at", "paramount" → "important", "multifaceted" → describe the specific facets
5. **Fix structure** — break long compounds, remove dangling -ing clauses, state things directly
6. **Vary sentence length** — AI defaults to uniform medium sentences. Mix short and long.
7. **Preserve meaning** — same information, just more naturally expressed

## Detection Report Format

When analyzing text, output:
- `paragraph_count`: number of paragraphs
- `patterns_found`: array of `{pattern_name, description, examples}` — examples must be exact phrases from the text
- `ai_probability`: 0-1 score. >0.9 if chatbot artifacts present. >0.8 if dense AI vocabulary. >0.5 if moderate patterns.
- `total_pattern_count`: sum of all individual pattern instances
