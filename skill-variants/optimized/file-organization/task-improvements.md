# File Organization Task Improvements

## Analysis of Current Tasks

### fileorg-messy (Organize a messy Downloads folder)

**Current eval criteria:**
- `structure` (custom, 40%): Checks subdirectories created, root cleaned, category names present
- `organization-quality` (llm-judge, 60%): Subjective quality assessment

**Benchmark results (opus):**
- With skill: 100/100, $0.029, 57s
- Without skill: 100/100, $0.025, 60s
- No differentiation — both score perfectly

**Issues identified:**
1. **`evalFileOrganization` is too lenient**: Only needs 4 category-matching directory names out of a generous list of 10 alternatives to get full marks on the 40-point category check
2. **LLM judge criterion at 60% is expensive and non-discriminating**: Both with-skill and without-skill get 1.0 from the judge since opus handles this trivially
3. **No test for file correctness**: The eval doesn't verify that files actually ended up in the right categories (e.g., `.jpg` in images, `.pdf` in documents)
4. **No fixture test file**: Should use `evalBunTest` pattern per CLAUDE.md conventions for deterministic scoring

### fileorg-dedup (Deduplicate a photo library)

**Current eval criteria:**
- `duplicate-detection` (custom, 100%): Checks if response text mentions all files in each known duplicate group

**Benchmark results (opus):**
- With skill: 75/100 (missed 1 of 4 groups despite having correct hash data)
- Without skill: 100/100

**Issues identified:**
1. **Eval is purely response-text-based**: Only checks if filenames are mentioned, not if they're correctly grouped together
2. **No verification that grouping is correct**: An agent could mention all filenames in a single paragraph and score 100%
3. **Only 4 duplicate groups with 10 files total**: Too small — a lucky guess could score well
4. **No fixture test file**: Should use `evalBunTest` for consistency

## Recommended Improvements

### fileorg-messy

1. **Replace LLM judge with deterministic bun-test**: Create a `.test.ts` fixture that checks:
   - Subdirectories exist for expected categories
   - Each file is in the correct category directory
   - No files remain in the downloads root
   - Total file count is preserved (nothing lost)
2. **Add more files to the fixture**: Increase from 30 to 30 (keep current set — it's already good)
3. **Make category matching stricter**: Check specific files in specific directories

### fileorg-dedup

1. **Expand the photo set**: Add more files and duplicate groups to make the task less trivial (15+ files, 5-6 duplicate groups)
2. **Add a bun-test fixture**: Write a test that parses the response for structured duplicate reporting
3. **Keep custom eval but improve it**: Check that files are grouped correctly, not just mentioned anywhere in the response

## Implementation Plan

1. Create `fixtures/fileorg-messy.test.ts` — deterministic test for file organization
2. Create `fixtures/fileorg-dedup.test.ts` — deterministic test for duplicate detection
3. Update `fixtures/setup-fixtures.ts` — expand dedup photo set
4. Update `tasks/fileorg-messy.task.ts` — switch to evalBunTest
5. Update `tasks/fileorg-dedup.task.ts` — add bun-test criterion
6. Update `src/eval/automated.ts` — keep existing functions as they work, add improvements
