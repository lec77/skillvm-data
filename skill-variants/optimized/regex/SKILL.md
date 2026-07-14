---
name: regex-patterns
description: Practical regex patterns across languages and use cases. Use when validating input (email, URL, IP), parsing log lines, extracting data from text, refactoring code with search-and-replace, or debugging why a regex doesn't match.
---

# Regex Patterns — Optimized

Focused guidance for regex tasks. Models already know basic syntax — this skill targets common failure modes and task-specific workflows.

## Workflow: Parsing Structured Text (Logs, CSV, Config)

1. **Read a sample** — inspect 5-10 lines to identify the format
2. **Identify field delimiters** — fixed-width, character-delimited, or mixed
3. **Build the regex incrementally** — anchor to reliable delimiters first, then capture variable fields
4. **Handle optional fields** — use `(?:...)?` for fields that appear only sometimes (e.g., error messages on ERROR lines only)
5. **Separate path from query string** — when URLs appear in logs, split at `?` before capturing the path: match `(/[^\s?]*)` for the path portion
6. **Type-cast numeric fields** — status codes and durations should be numbers, not strings
7. **Write output directly** — for structured extraction, write JSON directly rather than running external scripts when the data is small enough

## Critical Pitfalls

### Greedy vs Lazy

```
Pattern: ".*"     Input: "foo" and "bar"
Greedy:  matches  "foo" and "bar"     (first " to LAST ")
Lazy:    ".*?"    matches "foo"        (first " to NEXT ")
```

Use lazy `.*?` when extracting quoted strings. Greedy `.*` will overshoot to the last delimiter.

### Escaped Quotes in Strings

Log messages often contain escaped quotes: `"Connection to \"db-primary\" failed"`. To match the full message:

```
"((?:[^"\\]|\\.)*)"
```

This matches: any non-quote non-backslash char, OR a backslash followed by any char. Handles `\"` inside quoted strings.

### Query Strings in Paths

When extracting URL paths from log lines, a naive `\S+` captures the query string too. Split explicitly:

```
(?P<path>/[^\s?]*)(?:\?[^\s]*)?
```

The `[^\s?]*` stops at `?` or whitespace, cleanly separating path from query parameters.

### Context-Aware Pattern Application

When refactoring code with regex (e.g., renaming identifiers), don't blindly replace inside:
- **String literals** — SQL column names like `user_id` in `"WHERE user_id = ..."` must be preserved
- **Comments** — descriptive text about the old naming convention
- **Import paths** — file system paths like `../old-utils/db_helper` are not identifiers

Use word boundaries `\b` and check the surrounding context before replacing.

### Whitespace Variations

Log levels often have trailing spaces for alignment (`INFO  ` vs `ERROR`). Use `\s+` between fields rather than a single space, or capture with `\S+` which naturally stops at whitespace.

## Quick Reference — Patterns That Matter

| Task | Pattern | Note |
|------|---------|------|
| Quoted string (with escapes) | `"((?:[^"\\]|\\.)*)"` | Handles `\"` inside |
| URL path (no query) | `/[^\s?]*` | Stops at `?` or space |
| IP address (strict) | `\b(?:(?:25[0-5]\|2[0-4]\d\|[01]?\d\d?)\.){3}(?:25[0-5]\|2[0-4]\d\|[01]?\d\d?)\b` | Validates 0-255 |
| ISO timestamp | `\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}` | `YYYY-MM-DD HH:MM:SS` |
| Key=value pairs | `(\w+)=([^\s&]+)` | From query strings or configs |
| Phone (US, any format) | `(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}` | Handles `(555) 123-4567`, `555.123.4567`, etc. |
| Email (practical) | `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` | Covers 99% of real emails |
| Word boundary rename | `\bidentifier\b` | Won't match inside `my_identifier_name` |

## Language Tips

- **JavaScript**: Use `g` flag for `matchAll`/global `replace`. Named groups: `(?<name>...)`, access via `match.groups.name`
- **Python**: `re.compile()` for reuse in loops. `re.VERBOSE` for readable complex patterns. `re.DOTALL` makes `.` match newlines.
- **Go**: RE2 engine — no lookahead/lookbehind. Use `(?s)` for dotall, `(?m)` for multiline.
- **CLI**: `grep -P` for PCRE (full features). `grep -oP` to extract matches only.
