---
name: regex-patterns
description: Practical regex patterns across languages and use cases. Use when validating input (email, URL, IP), parsing log lines, extracting data from text, refactoring code with search-and-replace, or debugging why a regex doesn't match.
---

# Regex — Practical Recipes

## Recipe 1: Parse Log Lines → JSON

Given a log file, write a Node.js script to parse each line and output JSON.

**Step-by-step approach:**

1. Read the log file with `fs.readFileSync(filename, "utf-8")`
2. Split into lines with `.split("\n").filter(Boolean)`
3. For each line, use a single regex with capture groups to extract all fields
4. Convert numeric fields (status, duration) to numbers with `Number()` or `parseInt()`
5. For paths containing query strings like `/api/search?q=hello`, extract ONLY the path before `?`
6. For optional quoted messages (e.g., error messages in `"..."`), use an optional capture group
7. Only include the `message` field in the output object when it actually exists in the log line
8. Write output with `fs.writeFileSync("output.json", JSON.stringify(results, null, 2))`

**Key regex for log line with format `TIMESTAMP LEVEL IP METHOD /path STATUS DURATIONms "optional message"`:**

```javascript
const regex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\S+) (\w+) (\S+?) (?:\?\S+ )?(\d+) (\d+)ms(?: "(.*)")?$/;
// But this won't work perfectly. Better approach:
```

**Recommended: parse field by field instead of one big regex:**

```javascript
const lines = fs.readFileSync("server.log", "utf-8").split("\n").filter(Boolean);
const results = lines.map(line => {
  // Match: timestamp level ip method path_with_optional_query status duration optional_message
  const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\S+) (\w+) (\S+?) (\d+) (\d+)ms(?: "(.+)")?$/);
  if (!match) return null;
  const obj = {
    timestamp: match[1],
    level: match[2],
    ip: match[3],
    method: match[4],
    path: match[5].split("?")[0],  // CRITICAL: strip query string
    status: Number(match[6]),       // CRITICAL: must be number, not string
    duration_ms: Number(match[7]),  // CRITICAL: must be number, not string
  };
  if (match[8]) obj.message = match[8].replace(/\\"/g, '"'); // handle escaped quotes
  return obj;
}).filter(Boolean);
fs.writeFileSync("extracted.json", JSON.stringify(results, null, 2));
```

**Critical rules for log parsing:**
- `status` and `duration_ms` MUST be numbers (use `Number()`)
- Strip query strings from paths: use `.split("?")[0]`
- The `message` field must ONLY exist on entries that have a quoted message — do NOT add `message: undefined` or `message: null`
- Handle escaped quotes `\"` inside messages
- The `(\S+?)` for the path with a following space works because `\S+?` is lazy

## Recipe 2: Code Cleanup with Search-and-Replace

When asked to clean up code, you MUST replace EVERY `var` declaration — none should remain.

**Replacing `var` — the #1 priority:**

The task prompt will tell you EXACTLY which variables should use `const`. Only those specific named variables get `const`. ALL other `var` declarations become `let`.

**Example:** If the prompt says "use const for 'result' and 'fullName'", then:
```
var result = [];     → const result = [];    ← prompt said const for result
var count = 0;       → let count = 0;        ← not named, so use let
for (var i = 0;      → for (let i = 0;       ← not named, so use let
var valid = ...;     → let valid = ...;       ← not named, so use let
var fullName = ...;  → const fullName = ...;  ← prompt said const for fullName
```

**YOU MUST CHANGE EVERY SINGLE `var` TO EITHER `let` OR `const`. NO `var` SHOULD REMAIN IN THE OUTPUT. Go through each function carefully and change every `var`.**

**Complete cleanup checklist — apply ALL of these:**

1. Remove debug lines: delete any line containing both `console.log` and `DEBUG`
2. Remove debug constant: delete the `const DEBUG = true;` line AND its preceding comment (e.g. `// TODO: remove this debug logging`)
3. Replace ALL `var` → `const` or `let` as described above. Check EVERY function.
4. Fix `==` → `===` and `!=` → `!==` (strict equality)
5. Fix double spaces `"  "` → `" "` in string literals

**When writing the cleaned file, go through EVERY line and apply ALL transformations. Do not skip any `var` declaration.**

## Essential Regex Patterns

| Pattern | Use |
|---------|-----|
| `\d+` | Match digits |
| `\S+` | Match non-whitespace |
| `\w+` | Match word characters |
| `\b` | Word boundary |
| `(?: )?` | Optional non-capturing group |
| `.split("?")[0]` | Strip query string from URL path |
| `"(.*)"` | Capture quoted string (greedy) |
| `Number(str)` | Convert string to number in JS |
