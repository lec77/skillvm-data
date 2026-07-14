# Regex Task Improvements

## Analysis of Current Task (`regex-extract`)

The current task asks the agent to parse `server.log` (15 lines, custom format) into `extracted.json`. The log format is straightforward: `[timestamp] LEVEL IP METHOD PATH STATUS DURATIONms ["message"]`.

### Strengths
- Clean, deterministic fixture with pre-computable expected values
- Good mix of structural tests (array, fields, types) and correctness tests (counts, exact values)
- Conditional field handling (message only on ERROR lines) tests nuance

### Weaknesses

1. **Non-discriminating test criteria**: In Phase 1 evaluation, both with-skill and without-skill runs produced identical correct output for log parsing. The task is too easy for current models — the log format is simple and regular, requiring only a basic regex. The skill adds no value here.

2. **Missing edge cases in the fixture**: The log format has no ambiguity. Every line follows the exact same structure with only the optional message varying. Real logs have:
   - Quoted strings that may contain special characters (quotes, brackets)
   - Multi-word paths with encoded characters
   - Variable whitespace
   - Lines that don't match the expected format (partial writes, corrupted entries)

3. **Weight distribution doesn't prioritize differentiation**: The `ip-level-counts` criterion (weight 0.3) is trivially passed by anyone who parses the file correctly. The `exact-parsing` criterion (weight 0.3) is more valuable but tests only 2 specific entries.

4. **No test for regex-specific pitfalls**: The Phase 1 evaluation revealed that the skill's value is in preventing regex pitfalls (greedy matching, context-aware pattern application). The current task doesn't test any of these.

## Recommended Improvements

### 1. Enhance the fixture with harder edge cases

Add log lines that test common regex pitfalls:
- **Quoted messages containing quotes**: `"Connection to \"db-primary\" failed"` — tests proper escaped quote handling
- **Paths with query strings**: `/api/search?q=hello+world&page=2` — tests that the path is correctly delimited
- **Multi-word error messages with special chars**: `"SSL cert expired: CN=*.example.com, serial=0x1A2B"` — tests greedy vs lazy matching
- **Variable whitespace in level field**: `INFO` vs `WARN` vs `ERROR` have different lengths, already handled, but ensure test catches this

### 2. Add a query parameter extraction criterion

Extend the task to also extract query parameters from paths that have them. This requires splitting path at `?` and parsing key-value pairs — a task where regex skill genuinely helps (URL parsing patterns, key-value extraction).

### 3. Strengthen the test assertions

- Add tests for entries with special characters in messages
- Add a test that validates the timestamp format is preserved exactly
- Add a test for path extraction that ensures query strings are not included in the path

### 4. Adjust weights to favor differentiating criteria

- Reduce `structure` weight (trivially passed) from 0.20 to 0.10
- Increase `exact-parsing` weight from 0.30 to 0.35
- Add a new `edge-cases` criterion at weight 0.25 for the harder entries
- Reduce `ip-level-counts` from 0.30 to 0.20

### 5. Keep message-handling criterion

The conditional message field test (0.20 → keep at 0.10) is good but should also test that messages with escaped quotes are handled correctly.

## Implementation Plan

1. Update `server.log` to add 5 more lines with edge cases (20 total)
2. Update `server-log.test.ts` with new tests for edge cases
3. Update `regex-extract.task.ts` with revised criteria and weights
4. Verify opus scores 100 on the updated task
