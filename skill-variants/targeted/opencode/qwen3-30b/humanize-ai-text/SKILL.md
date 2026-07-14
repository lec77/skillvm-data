---
name: humanize-ai-text
description: Detect and rewrite AI-generated text patterns. Read input files with Read tool, write output files with Write tool. After writing any JSON file, ALWAYS run python3 scripts/fix_json.py <filename> to validate it.
allowed-tools:
  - Read
  - Write
  - StrReplace
  - Glob
  - Bash
---

# Humanize AI Text

Detect AI patterns in text and rewrite text to sound human.

CRITICAL RULE: After writing ANY JSON file, you MUST run this command to validate and fix it:
```bash
python3 scripts/fix_json.py <filename>
```
This ensures the JSON is valid. Always do this step.

## AI Patterns to Detect

**filler_phrases**: "It's important to note", "It's worth noting", "furthermore"

**ai_vocabulary**: delving/delve, tapestry, landscape, robust, paramount, leveraging, harnessing, multifaceted, nuanced, holistic, synergy, comprehensive, ecosystem, foster (IMPORTANT: always check for "delving" — it is one of the most common AI words)

**chatbot_artifacts**: "As an AI language model", "As an AI", "I hope this helps"

**promotional_language**: cutting-edge, groundbreaking, revolutionize, transformative

## Task: Detect AI Patterns

Read the input file. Count paragraphs (text blocks separated by blank lines — NOT blank lines themselves). Find all AI pattern instances. Write a JSON report.

Write detection_report.json with this structure:
```json
{
  "paragraph_count": 4,
  "patterns_found": [
    {"pattern_name": "filler_phrases", "description": "Filler phrases", "examples": ["It's important to note"]},
    {"pattern_name": "ai_vocabulary", "description": "AI vocabulary", "examples": ["delving", "tapestry"]},
    {"pattern_name": "chatbot_artifacts", "description": "Chatbot references", "examples": ["As an AI language model"]},
    {"pattern_name": "promotional_language", "description": "Hype language", "examples": ["cutting-edge"]}
  ],
  "ai_probability": 0.95,
  "total_pattern_count": 17
}
```

Then run: `python3 scripts/fix_json.py detection_report.json`

## Task: Rewrite AI Text

1. Read source file
2. Rewrite removing AI patterns, keeping core meaning
3. Write rewritten.txt
4. Write changes_summary.json
5. Run: `python3 scripts/fix_json.py changes_summary.json`

Replacements: leveraging→using, paramount→important, robust→strong, holistic→complete, multifaceted→complex, nuanced→detailed, pivotal→key, seamless→smooth, synergy→teamwork

Remove entirely: "It's important to note", "furthermore", "delving into"

Keep word count within 50% of original. Preserve topic keywords (remote, team, communication).

changes_summary.json structure:
```json
{
  "original_word_count": 100,
  "rewritten_word_count": 85,
  "patterns_removed": ["It's important to note", "leveraging", "paramount"],
  "readability_improved": true
}
```

Then run: `python3 scripts/fix_json.py changes_summary.json`
