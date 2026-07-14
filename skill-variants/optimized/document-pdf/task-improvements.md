# Task Improvements: document-pdf

## Current Issues

### 1. Ambiguous pattern matching in fact-extraction
The current `EXPECTED_FACTS` check patterns against `response.text` (the agent's conversational output). Many patterns are ambiguous:
- `"12%"` matches both "12% YoY growth" and "Services 12%" — two different facts
- `"15%"` could match South's YoY or any percentage the agent mentions
- `"20%"` matches Enterprise Add-ons share or any other 20% reference
- Simple `text.includes()` can't distinguish context

This inflates scores — an agent could score well by mentioning numbers without correctly attributing them.

### 2. No structured output validation
The task only evaluates the agent's conversational response, not any output files. Other mature tasks in the benchmark (data-summary, debug-bsearch) use `bun-test` with fixture test files that validate structured output. This is more reliable and allows partial credit.

### 3. LLM-judge at 50% weight is too subjective
The summary-quality criterion is purely qualitative. For a data extraction task, objective correctness should dominate the score.

### 4. No output file requirement
The prompt says "provide a structured summary" but doesn't ask the agent to write a file. This means evaluation depends entirely on parsing the conversational response, which is fragile.

## Proposed Changes

### Change the task to produce structured output files
Modify the prompt to ask the agent to:
1. Extract tables and save as `pdf_extract.json` with the regional revenue table and product breakdown table
2. Write a markdown summary to `summary.md`

### Replace custom fact-extraction with bun-test
Create `pdf-extract.test.ts` that validates:
- `pdf_extract.json` exists and is valid JSON
- Regional revenue table has correct structure (4 regions + total)
- Specific values are correct (North Q1=1250, West YTD=6350, Total YTD=18160)
- Product breakdown has 4 products with correct revenues
- YoY growth percentages are captured correctly
- summary.md exists and contains markdown tables

### Adjust weights
- bun-test criteria: 70% total (split across 7 specific assertions)
- LLM-judge for summary quality: 30%

This ensures objective correctness dominates while still rewarding good presentation.
