---
name: regex-patterns
description: Practical regex patterns across languages and use cases. Use when validating input (email, URL, IP), parsing log lines, extracting data from text, refactoring code with search-and-replace, or debugging why a regex doesn't match.
metadata: {"clawdbot":{"emoji":"🔤","requires":{"anyBins":["grep","python3","node"]},"os":["linux","darwin","win32"]}}
---

# Regex Patterns

## Task: Extract Structured Data from Logs

When asked to parse log files and extract structured data, ALWAYS write a Node.js or Python script to do the parsing. NEVER manually write JSON by hand — it's error-prone with many entries.

### Approach: Write a parsing script

Write a Node.js script (parse.mjs) that:
1. Reads the log file line by line
2. Uses a regex to extract fields from each line
3. Handles query strings in URLs — strip everything from `?` onward to get just the path
4. Handles optional quoted messages at end of line (ERROR entries only)
5. Handles escaped quotes inside messages like `\"db-primary\"`
6. Converts status and duration_ms to numbers with parseInt()
7. Only includes `message` field on ERROR entries — omit it entirely for INFO/WARN
8. Writes valid JSON to the output file

### Recommended regex for log lines:

```javascript
const regex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\S+) (\w+) (\S+?) (\d+) (\d+)ms(?: "(.*)")?$/;
```

### Handling the path field:

```javascript
let path = match[5];
const qIdx = path.indexOf('?');
if (qIdx !== -1) path = path.substring(0, qIdx);
```

### Handling escaped quotes in messages:

```javascript
let message = match[8];
if (message) message = message.replace(/\\"/g, '"');
```

### Building the entry:

```javascript
const entry = {
  timestamp: match[1],
  level: match[2],
  ip: match[3],
  method: match[4],
  path: path,
  status: parseInt(match[5 + 1]),  // status group
  duration_ms: parseInt(match[5 + 2])  // duration group
};
if (entry.level === 'ERROR' && message) {
  entry.message = message;
}
```

### Run the script after writing it:

```bash
node parse.mjs
```

Then verify extracted.json exists and looks correct.

## Task: Code Cleanup with Regex Search-and-Replace

When asked to clean up code using regex replacements:

1. **Read the source file** to understand what needs changing
2. **Apply changes in this order** (order matters to avoid conflicts):
   a. **Remove debug lines** — delete entire lines containing `console.log` with `DEBUG` in them
   b. **Remove debug constants** — delete lines like `const DEBUG = true;` and associated TODO comments
   c. **Replace `var` with `let` or `const`**:
      - `const` for: arrays initialized with `[]`, string concatenations, values never reassigned
      - `let` for: loop counters (`i`), accumulators that get incremented (`count`), simple boolean assignments (`valid`)
   d. **Fix equality operators** — replace `==` with `===` and `!=` with `!==`
   e. **Fix whitespace in strings** — replace `"  "` (double space) with `" "` (single space)
3. **Write the cleaned file** to the output filename specified in the prompt
4. **Preserve all other code** — function signatures, logic, indentation unchanged

### var → let/const decision:

| Variable | Use | Reason |
|----------|-----|--------|
| `result = []` | `const` | Array reference never reassigned |
| `count = 0` | `let` | Incremented later |
| `i` in for loop | `let` | Loop variable |
| `valid = expr` | `let` | Simple boolean assignment |
| `fullName = str + str` | `const` | Assigned once |

## Quick Reference

| Pattern | Use |
|---------|-----|
| `\b` | Word boundary — prevents partial matches |
| `\S+` | Non-whitespace run |
| `.*?` | Lazy match — stops at first delimiter |
| `(?:...)?` | Optional non-capturing group |
| `[^\s?]*` | Matches until space or `?` |
