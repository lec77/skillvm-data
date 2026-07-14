# XLSX Task Improvements

## Problems with Current Task

### 1. Weak eval criteria — no programmatic verification
The current task uses only two criteria:
- `file-created` (weight 0.3): Custom check that just verifies an xlsx file exists
- `data-accuracy` (weight 0.7): LLM judge with a vague rubric

The LLM judge rubric is too coarse ("all data present" vs "incomplete" vs "no output") — it can't distinguish formula-based spreadsheets from hardcoded ones, which is the primary skill differentiator.

### 2. No fixture test file
The task has no `.test.ts` fixture for programmatic scoring. This means partial credit is impossible — it's all-or-nothing from the judge. Other tasks (like `document-pdf`) use `evalBunTest` with 5-7 independent assertions.

### 3. No deterministic expected values
The prompt doesn't specify exact revenue numbers, making it impossible to verify data accuracy programmatically. The PDF task specifies exact figures (e.g., "North Q1 = 1250") so tests can check them.

### 4. Formula usage not tested
The skill's core value-add is "use Excel formulas instead of hardcoding." Neither criterion checks whether the output contains actual formulas vs hardcoded computed values.

### 5. Missing conditional formatting test
The prompt asks for conditional formatting (red on cells < $50K) but no criterion verifies this.

## Recommended Changes

### Replace with bun-test criteria
Create `fixtures/sales-report.test.ts` that uses openpyxl-equivalent checks via a Python helper script:

1. **File exists and is valid xlsx** (weight 0.1)
2. **Has 5 product lines** (weight 0.1) — check row/column labels
3. **Has Q1-Q4 columns** (weight 0.1) — check headers
4. **Revenue values are present** (weight 0.1) — specify exact values in prompt
5. **SUM formulas exist** (weight 0.15) — check for `=SUM(` in cells
6. **AVERAGE formulas exist** (weight 0.15) — check for `=AVERAGE(` in cells
7. **Conditional formatting or red fill on cells < $50K** (weight 0.1) — check formatting
8. **Summary quality** (weight 0.2) — LLM judge for overall quality

### Specify deterministic data
Add exact revenue figures to the prompt so tests can verify correctness:
- Widgets: $62K, $71K, $58K, $80K
- Gadgets: $45K, $52K, $48K, $63K
- Services: $38K, $42K, $35K, $47K
- Licenses: $85K, $91K, $78K, $95K
- Support: $28K, $32K, $25K, $36K

These values ensure some cells are below $50K (triggering conditional formatting) and the totals/averages are pre-computable for verification.

### Test approach
Since openpyxl is a Python library and the test runs in bun, write a Python verification script that the test invokes to inspect the xlsx file. The script outputs JSON with structured results that the bun test file parses.
