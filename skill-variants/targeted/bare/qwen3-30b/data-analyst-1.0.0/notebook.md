# Optimization Notebook — `data-analyst-1.0.0` (bare/qwen3-30b)

## Baseline — 2026-03-31

**AOT score** (`csv-pivot`): 100/100

---

## Round 1 — 2026-03-31 | JIT on `data-clean`

**JIT task score**: 0/100
**Grader summary**: Agent failed to invoke any tools correctly (all read_file/write_file/execute_command calls returned errors), resulting in 0/100 with no output files produced. Added explicit tool usage guidance, troubleshooting fallbacks, and a complete ready-to-use Python script template for data cleaning tasks.
**Failed criteria**: files-exist, row-count, no-duplicates, dates-standardized, report-accuracy

**Planned changes**:
- Added CRITICAL tool usage section at top with explicit instructions to write script then execute it
- Added troubleshooting section with fallback approaches (heredoc, cat) when primary tool calls fail
- Provided complete ready-to-use Python script template for data cleaning that can be copied with minimal adaptation
- Added instruction to NEVER give up without producing output files
- Added note about reading prompt carefully for before-dedup vs after-dedup counting

**Skill size**: 4584 → 10086 chars

**Test task result** (`csv-pivot`): 100/100 (prev: 100/100, +0.0)

---

## Round 2 — 2026-03-31 | JIT on `multi-dataset-report`

**JIT task score**: 0/100
**Grader summary**: Agent repeatedly wrote Python with the same f-string syntax error (nested parens inside braces) and never self-corrected across 8+ attempts, producing no output files. Added explicit ban on f-strings with expressions, error loop prevention rules, and simplified print patterns.
**Failed criteria**: sales-exists, inventory-exists, customers-exists, sales-revenue, inventory-lowstock, customer-churn, report-exists, cross-dataset

**Planned changes**:
- Added explicit rule to NEVER use f-strings with function calls/expressions — assign to variable first
- Added error loop prevention: MUST change approach after seeing same error twice, with specific diagnostic steps
- Simplified Python template to use only safe print patterns
- Added multi-file cross-dataset analysis guidance

**Skill size**: 10086 → 5607 chars

**Test task result** (`csv-pivot`): 100/100 (prev: 100/100, +0.0)

---

## Round 3 — 2026-03-31 | JIT on `data-clean`

**JIT task score**: 65/100
**Grader summary**: Agent's date standardization missed common formats (YYYY/MM/DD, 'Month D YYYY' without comma), causing 0 on dates-standardized and partial report accuracy. Added comprehensive date format list and clarified missing-value vs invalid-email distinction.
**Failed criteria**: dates-standardized, report-accuracy

**Planned changes**:
- Added robust standardize_date function with 15+ common date formats including YYYY/MM/DD and 'Month D YYYY' (no comma)
- Clarified that empty email = missing value, not invalid email
- Added explicit processing order for cleaning tasks (count before dedup, then dedup)
- Added check that original != converted for counting standardized dates

**Skill size**: 5607 → 5975 chars

**Test task result** (`csv-pivot`): 100/100 (prev: 100/100, +0.0)

## Baseline — 2026-03-31

**AOT score** (`full-pipeline`): 49.7/100

---

## Round 1 — 2026-03-31 | JIT on `multi-dataset-report`

**JIT task score**: 0/100
**Grader summary**: Agent skipped writing a Python script, manually hardcoded incorrect values into JSON files, and wrote them to a subdirectory instead of the current working directory. Added mandatory rules to always use Python for computation and always write to current directory, plus multi-file analysis template.
**Failed criteria**: sales-exists, inventory-exists, customers-exists, sales-revenue, inventory-lowstock, customer-churn, report-exists, cross-dataset

**Planned changes**:
- Added CRITICAL mandatory rules section at top: always use Python, never hardcode values, always write to current directory
- Added multi-file analysis section with explicit pattern for reading multiple CSVs and writing multiple JSON outputs from one script
- Made verification checklist include explicit current-directory check
- Restructured workflow to emphasize single-script approach for all processing

**Skill size**: 4584 → 8323 chars

**Test task result** (`full-pipeline`): 100/100 (prev: 49.7/100, +50.3)

---

## Round 2 — 2026-03-31 | JIT on `stat-analysis`

**JIT task score**: 100/100
**Grader summary**: Agent scored 100/100 on statistical analysis task. Added general-purpose statistical computation section (descriptive stats, Pearson correlation) using only stdlib, since this capability was exercised but not previously documented in the skill.
**Failed criteria**: none

**Planned changes**:
- Added Statistical Computations section with descriptive stats and Pearson correlation implementations using only math stdlib
- Added guidance to prefer stdlib over numpy/scipy/pandas which may not be available
- Added key details about sample vs population std and rounding conventions

**Skill size**: 8323 → 9757 chars

**Test task result** (`full-pipeline`): 100/100 (prev: 100/100, +0.0)

---

## Round 3 — 2026-03-31 | JIT on `trend-analysis`

**JIT task score**: 100/100
**Grader summary**: Agent scored 100/100 but hit a NameError on first run because write_json was called before being defined. Added explicit rule to define all functions before calling them and reordered the script template to emphasize this pattern.
**Failed criteria**: none

**Planned changes**:
- Added rule #5: ALWAYS define ALL functions before calling them
- Reordered script template to make function-first pattern clearer
- Added integer vs float guidance for JSON output
- Added growth/change calculation pattern
- Removed task-specific filenames from data cleaning section

**Skill size**: 9757 → 10175 chars

**Test task result** (`full-pipeline`): 100/100 (prev: 100/100, +0.0)
