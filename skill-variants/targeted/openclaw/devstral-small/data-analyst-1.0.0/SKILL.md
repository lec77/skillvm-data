---
name: data-analyst
version: 1.0.0
description: "CSV data analysis: cleaning, pivoting, aggregation, and JSON report generation."
author: openclaw
---

# Data Analyst Skill

Analyze CSV files, clean data, compute aggregations, and produce JSON reports.

## CSV Analysis Workflow

When asked to analyze CSV data, follow these steps:

1. **Read** the CSV file(s) completely
2. **Inspect** the data for issues (duplicates, missing values, format inconsistencies)
3. **Process** the data (clean, aggregate, compute)
4. **Write** output files in the exact format requested

## Data Cleaning Rules

When cleaning CSV data:

- **Duplicates**: Compare entire rows. If two rows have identical values in ALL columns, keep only the first occurrence. Count how many duplicate rows were removed.
- **Missing values**: A cell is "missing" if it is completely empty (nothing between the commas). Count ALL empty cells across all rows and columns. Do NOT fabricate or fill in missing data — leave empty cells empty.
- **Date standardization**: Convert ALL date formats to YYYY-MM-DD. Common formats to handle:
  - MM/DD/YYYY (e.g., 01/20/2026 → 2026-01-20)
  - MM-DD-YYYY (e.g., 02-05-2026 → 2026-02-05)
  - YYYY/MM/DD (e.g., 2026/02/10 → 2026-02-10)
  - Month D YYYY (e.g., March 3 2026 → 2026-03-03)
  - Dates already in YYYY-MM-DD format do NOT count as "standardized"
- **Invalid emails**: An email is invalid if it lacks a proper TLD (top-level domain), e.g., "user@example" instead of "user@example.com". Do NOT modify invalid emails — just count them.

## CSV Pivot / Aggregation

When computing revenue from sales data:

- **Revenue per row** = amount * quantity (multiply the amount column by the quantity column)
- **Total revenue** = sum of (amount * quantity) for all rows
- **Top product/region** = the one with highest total revenue
- **Monthly breakdown**: Group by month (YYYY-MM format), sum revenue per month, sort chronologically
- **Product summary**: Group by product, compute total_revenue and total_quantity per product, sort by total_revenue descending

## Multi-Dataset Analysis

When analyzing multiple related datasets:

1. Process each dataset independently first
2. For sales data: remove duplicate rows before computing totals. Revenue = the Revenue column value (not amount*quantity). Sum the Revenue column after dedup.
3. For inventory: items are "low stock" when Quantity < MinLevel
4. For customers: retention_rate = (count of Active=true / total customers) * 100. Churn = count of Active=false.
5. Cross-dataset report must reference specific findings from ALL datasets (mention revenue figures, inventory stock levels, and customer retention/churn numbers together)

## JSON Output Format

Always write valid JSON. Use exact field names as specified in the task. Example structure:

```json
{
  "field_name": 42100,
  "top_item": "ItemName",
  "breakdown": [
    {"label": "2026-01", "value": 8150}
  ]
}
```

## Important Reminders

- Write a script (Python or Node.js) to process CSV data — do not try to do calculations manually
- Always read the CSV file first to understand its structure before writing processing code
- Double-check that output JSON is valid (proper quoting, no trailing commas)
- When counting issues (duplicates, missing values, etc.), count on the ORIGINAL data before any cleaning
- Revenue calculations: pay attention to whether the task says amount*quantity or just the Revenue column
