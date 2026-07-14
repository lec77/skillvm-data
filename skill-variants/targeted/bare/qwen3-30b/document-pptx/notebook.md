# Optimization Notebook — `document-pptx` (bare/qwen3-30b)

## Baseline — 2026-03-31

**AOT score** (`pptx-data-deck`): 66.7/100

---

## Round 1 — 2026-03-31 | JIT on `pptx-extract`

**JIT task score**: 0/100
**Grader summary**: ```json
{
  "expectations": [
    {
      "criterion": "file-exists",
      "automated_score": 0,
      "justified": true,
      "suggested_score": 0,
      "reasoning": "The agent never successfully 
**Failed criteria**: none

**Planned changes**:

**Skill size**: 4249 → 5550 chars

**Test task result** (`pptx-data-deck`): 0/100 (prev: 66.7/100, -66.7)

---

## Round 2 — 2026-03-31 | JIT on `pptx-create`

**JIT task score**: 100/100
**Grader summary**: ```json
{
  "expectations": [
    {
      "criterion": "file-exists",
      "automated_score": 1,
      "justified": true,
      "suggested_score": 1,
      "reasoning": "The agent ran a Python script
**Failed criteria**: none

**Planned changes**:

**Skill size**: 4249 → 4175 chars

**Test task result** (`pptx-data-deck`): 0/100 (prev: 0/100, +0.0)

---

## Round 3 — 2026-03-31 | JIT on `pptx-notes`

**JIT task score**: 100/100
**Grader summary**: ```json
{
  "expectations": [
    {
      "criterion": "file-exists",
      "automated_score": 10,
      "justified": true,
      "suggested_score": 10,
      "reasoning": "The workspace listing in st
**Failed criteria**: none

**Planned changes**:

**Skill size**: 4249 → 6376 chars

**Test task result** (`pptx-data-deck`): 55.3/100 (prev: 0/100, +55.3)

## Baseline — 2026-03-31

**AOT score** (`pptx-data-deck`): 88.7/100

---

## Round 1 — 2026-03-31 | JIT on `pptx-extract`

**JIT task score**: 100/100
**Grader summary**: Training task scored 100/100. Generalized the skill by removing task-specific hardcoded field names (slides_data.json, total_revenue, yoy_growth, regions) and replacing with task-agnostic patterns. Added an explicit 'explore first' step and organized extraction into modular patterns (tables, notes, numeric parsing). Kept conservative changes given Round 1 regression history.
**Failed criteria**: none

**Planned changes**:
- Removed hardcoded task-specific output filename and field names from extraction example
- Added explicit Step 1: ALWAYS explore the PPTX first before writing extraction code
- Separated extraction patterns into modular sections (tables, notes, numeric parsing) instead of one monolithic task-specific script
- Added table extraction pattern that was missing from original skill
- Added speaker notes extraction pattern
- Emphasized reading task prompt for exact output field names and filenames

**Skill size**: 4249 → 5908 chars

**Test task result** (`pptx-data-deck`): 66.7/100 (prev: 88.7/100, -22.0)

---

## Round 2 — 2026-03-31 | JIT on `pptx-create`

**JIT task score**: 100/100
**Grader summary**: Training task scored 100/100 (creation task). The current skill contains hardcoded task-specific field names (total_revenue, yoy_growth, regions, slides_data.json) that hurt generalization. Removed hardcoded fields while keeping the structural extraction pattern. Added table extraction, speaker notes extraction, and numeric parsing as modular patterns. Previous round's attempt to generalize also regressed (-22), so this version keeps the core extraction template closer to the working baseline while removing only the truly task-specific parts.
**Failed criteria**: none

**Planned changes**:
- Removed hardcoded task-specific field names (total_revenue, yoy_growth, regions) and output filename (slides_data.json) from extraction example
- Added modular extraction patterns: tables, speaker notes, numeric parsing as separate reusable sections
- Added table creation and speaker notes creation examples
- Added explicit tip about repeating the bullet pattern for multiple content slides
- Kept core slide title/bullets separation pattern that works across tasks

**Skill size**: 4249 → 4808 chars

**Test task result** (`pptx-data-deck`): 66.7/100 (prev: 66.7/100, +0.0)

---

## Round 3 — 2026-03-31 | JIT on `pptx-notes`

**JIT task score**: 100/100
**Grader summary**: The skill contained hardcoded task-specific field names (total_revenue, yoy_growth, regions, slides_data.json) that helped one test task but hurt generalization. Replaced with task-agnostic patterns while adding speaker notes support from the training task. Made extraction patterns modular and emphasized reading task prompt for exact output format.
**Failed criteria**: none

**Planned changes**:
- Removed hardcoded task-specific field names and output filenames from extraction example
- Added speaker notes read/write patterns as a dedicated section
- Added explicit Step 1 to read task prompt for exact output filenames and JSON keys
- Split extraction into modular reusable patterns: title/bullets, tables, numeric parsing
- Added section for modifying existing presentations
- Made output JSON building explicitly task-dependent with clear placeholder

**Skill size**: 4249 → 5008 chars

**Test task result** (`pptx-data-deck`): 88.7/100 (prev: 66.7/100, +22.0)
