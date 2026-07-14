# SQL Task Improvement Plan

## Analysis of Current Task (sql-query)

The current task asks agents to import a CSV into SQLite and run 3 business queries. Based on Phase 1 evaluation across 12 runs (6 iterations × 2 configurations), here are the findings:

### Strengths
- Deterministic fixture data with pre-computable expected answers
- Multiple independent assertions (7 tests) enabling partial credit
- Good weight distribution (60% on correctness, the hardest part)

### Gaps Identified in Phase 1 Testing

1. **No type verification**: The biggest SQLite gotcha — `.import` makes everything TEXT — is not tested. The schema criterion checks column *names* but not column *types*. An agent that imports with all-TEXT columns still passes if the queries work (they would, since SQLite is loosely typed and `"5" * "12.50"` works in SQL).

2. **No index testing**: The skill emphasizes indexing but the eval doesn't check for it. Since the dataset is only 15 rows, indexes don't matter for correctness, but creating appropriate indexes demonstrates skill-guided best practices.

3. **Missing edge cases in queries**: The current queries (SUM, GROUP BY, ORDER BY) are all basic aggregations. Phase 1 showed that CTEs and window functions are where skills provide workflow guidance — but these aren't tested.

4. **No data type awareness in results**: `total_revenue` is checked with `toBeCloseTo` (good), but there's no check that the agent handled potential floating-point issues correctly or that the JSON contains proper numeric types (not strings).

5. **Criterion weight imbalance**: "Database file created" (10%) and "Query results file exists" (10%) are trivially satisfied — they just check file existence. Together they give 20% for doing almost nothing. These should have lower weight, redirecting weight to differentiation criteria.

### Recommendations

#### A. Enhance fixture data
- Add rows with edge cases: NULL/empty values in quantity or price columns, to test COALESCE handling
- Add a `discount` column to test multi-column arithmetic (revenue = qty * price * (1 - discount))
- This makes the computation non-trivial and tests the "gotcha" that empty CSV fields become empty strings in SQLite

#### B. Add schema quality criterion
- Test that numeric columns use INTEGER/REAL types, not all TEXT
- Test that the agent created at least one index
- This directly tests what the skill teaches about `.import` type coercion

#### C. Add advanced query criterion
- Add a 4th query requiring a CTE or window function (e.g., running cumulative revenue by date, or customer rank by spending)
- This tests whether the skill's CTE/window function patterns help

#### D. Reweight criteria
- Reduce file-existence weights (db-exists: 5%, results-exists: 5%)
- Add schema-quality: 15% (types + index)
- Add advanced-query: 15%
- Keep basic correctness at 60% → split into basic-queries: 40% + advanced-query: 20%

#### E. Tighten test assertions
- Check that `total_revenue` is a number, not a string
- Check `product_ranking` is an array of strings (not objects)
- Add tolerance-based checks for floating point values

### Revised Criteria

| ID | Name | Weight | What it tests |
|----|------|--------|---------------|
| db-exists | Database created | 0.05 | shop.db exists |
| schema | Schema correctness | 0.15 | Columns, row count, numeric types (not all TEXT) |
| index | Index created | 0.10 | At least one index on a useful column |
| results-exist | Results file created | 0.05 | query_results.json exists |
| basic-queries | Basic query correctness | 0.35 | total_revenue, top_customer, product_ranking |
| advanced-query | Advanced query (CTE/window) | 0.30 | monthly_revenue and customer_rank using CTE or window function |

### Revised Fixture

Expand `orders.csv` to ~20 rows with:
- A `discount` column (some NULL/empty, requiring COALESCE)
- Multiple months of data (to enable monthly aggregation)
- This makes revenue calculation: `qty * unit_price * (1 - COALESCE(discount, 0))`

### Revised Prompt

Add two advanced query requirements:
- `monthly_revenue`: Revenue by month (requires strftime for SQLite date grouping)
- `customer_rank`: Customers ranked by total spending with their rank number (requires window function RANK() or ROW_NUMBER())
