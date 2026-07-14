---
name: data-analyst
version: 1.0.0
description: "CSV data analysis with Python: cleaning, aggregation, pivoting, and report generation."
author: openclaw
---

# Data Analyst — CSV Analysis Guide

Analyze CSV files using Python and pandas. Always write a Python script, execute it, and verify the output.

## CRITICAL: Data Cleaning Report Counting Rules

When asked to produce a cleaning report counting issues like duplicates, missing values, dates needing standardization, and invalid emails:

**You MUST deduplicate the data FIRST, then count all issues on the deduplicated rows.**

The reason: if row A is duplicated as row A', both have the same issues. Counting both would double-count. The correct count reflects unique issues only.

For example, if you have 15 rows with 3 duplicates = 12 unique rows:
- `duplicates_removed` = 3 (15 - 12)
- `missing_values` = count empty cells among the 12 unique rows only
- `dates_standardized` = count non-YYYY-MM-DD dates among the 12 unique rows only
- `invalid_emails` = count malformed emails among the 12 unique rows only

**USE THIS EXACT PATTERN for data cleaning tasks:**

```python
import pandas as pd
import json

df = pd.read_csv('input.csv')

# Step 1: Deduplicate
df_clean = df.drop_duplicates()
duplicates_removed = len(df) - len(df_clean)

# Step 2: Count issues on df_clean (NOT on df!)
missing_values = int(df_clean.isnull().sum().sum())

date_col = df_clean['signup_date'].dropna().astype(str)
dates_standardized = int((~date_col.str.fullmatch(r'\d{4}-\d{2}-\d{2}')).sum())

email_col = df_clean['email'].dropna().astype(str)
invalid_emails = int((~email_col.str.fullmatch(r'[^@]+@[^@]+\.[^@]+')).sum())

# Step 3: Fix dates
mask = df_clean['signup_date'].notna() & (df_clean['signup_date'].astype(str).str.strip() != '')
df_clean.loc[mask, 'signup_date'] = pd.to_datetime(
    df_clean.loc[mask, 'signup_date'], format='mixed'
).dt.strftime('%Y-%m-%d')

# Step 4: Write outputs
df_clean.to_csv('cleaned_data.csv', index=False)
with open('cleaning_report.json', 'w') as f:
    json.dump({"duplicates_removed": duplicates_removed, "missing_values": missing_values,
               "dates_standardized": dates_standardized, "invalid_emails": invalid_emails}, f, indent=2)
```

## Workflow

1. Read CSV with pandas: `df = pd.read_csv('file.csv')`
2. Inspect: `print(df.columns.tolist())` then `print(df.head())`
3. Clean: deduplicate, standardize dates, identify issues
4. Analyze: compute metrics
5. Output: write results as JSON or CSV

## Aggregation & Pivoting

### Revenue Calculation
Check if revenue = amount * quantity or if revenue is a direct column.
```python
# If amount and quantity are separate columns:
df['revenue'] = df['amount'] * df['quantity']

# If revenue is already a column:
total_revenue = df['Revenue'].sum()
```

### Group By & Summaries
```python
# Top product by revenue
by_product = df.groupby('product')['revenue'].sum().sort_values(ascending=False)
top_product = by_product.index[0]

# By region
by_region = df.groupby('region')['revenue'].sum()
top_region = by_region.idxmax()

# Monthly breakdown
df['month'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m')
monthly = df.groupby('month')['revenue'].sum().sort_index()
monthly_list = [{"month": m, "revenue": float(v)} for m, v in monthly.items()]

# Product summary sorted by revenue desc
summary = df.groupby('product').agg(
    total_revenue=('revenue', 'sum'),
    total_quantity=('quantity', 'sum')
).sort_values('total_revenue', ascending=False).reset_index()
product_list = summary.to_dict('records')
```

## JSON Output

```python
import json
result = {"total_revenue": float(total_revenue), "top_product": str(top_product)}
with open('output.json', 'w') as f:
    json.dump(result, f, indent=2)
```

## Multi-Dataset Analysis

Process each dataset independently, write separate JSON files, then create a cross-dataset report.

```python
# Low stock detection
low_stock = df[df['Quantity'] < df['MinLevel']]
low_stock_skus = low_stock['SKU'].tolist()

# Retention/Churn
total = len(df)
active = df[df['Active'] == True].shape[0]
churn_count = total - active
retention_rate = round(active / total * 100, 2)

# Cross-dataset report must reference sales, inventory, AND customer findings
report = {
    "summary": "Cross-dataset analysis combining sales, inventory, and customer data",
    "sales_highlights": {"total_revenue": ..., "top_product": ...},
    "inventory_highlights": {"low_stock_count": ..., "low_stock_items": ...},
    "customer_highlights": {"retention_rate": ..., "churn_count": ...}
}
```

## Critical Rules

1. **Always deduplicate** before computing totals
2. **Use float()** when writing numbers to JSON to avoid numpy type errors
3. **Dates**: use `pd.to_datetime(col, format='mixed')` to handle mixed formats
4. **Count cleaning issues on deduplicated rows** — see top section
5. **Column names are case-sensitive** — check with `df.columns.tolist()`
6. **Verify output** by reading back files you created
