---
name: data-analyst
version: 1.0.0
description: CSV data analysis — read CSVs, compute metrics, output JSON results
author: openclaw
---

# Data Analyst — CSV Analysis

## CRITICAL RULES

1. Write ONE Python script that does ALL reading, computing, and file writing. Run it with `python3 script.py`.
2. NEVER use f-strings. Use plain strings, string concatenation with +, or str.format() instead.
3. Use unique variable names — never reuse a variable name inside loops.
4. If a script has a syntax error, rewrite the ENTIRE file from scratch. Do NOT try to edit it.
5. All output must be written to files by the script. Do not just print results.

## Step-by-step Process

1. Write a complete Python script (e.g., `analyze.py`)
2. Run: `python3 analyze.py`
3. If error: rewrite the entire script file and run again
4. Verify output files exist

## Python Patterns

### Read CSV and compute revenue
```python
import pandas as pd, json, re

df = pd.read_csv('data.csv')
df['revenue'] = df['amount'] * df['quantity']
grand_total = float(df['revenue'].sum())

# Group by product
prod_rev = df.groupby('product')['revenue'].sum()
top_product = prod_rev.idxmax()

# Product summary — use DIFFERENT variable names than grand_total
summary_list = []
for prod_name, grp in df.groupby('product'):
    prod_total = float(grp['revenue'].sum())
    prod_qty = int(grp['quantity'].sum())
    summary_list.append({'product': prod_name, 'total_revenue': prod_total, 'total_quantity': prod_qty})
summary_list.sort(key=lambda x: x['total_revenue'], reverse=True)
```

### Monthly breakdown
```python
df['month'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m')
monthly = df.groupby('month')['revenue'].sum().reset_index()
monthly.columns = ['month', 'revenue']
monthly['revenue'] = monthly['revenue'].apply(float)
monthly_list = monthly.sort_values('month').to_dict('records')
```

### Complete Data Cleaning Workflow

IMPORTANT: Follow this exact order. Work on ONE dataframe throughout.

```python
import pandas as pd, json, re

df = pd.read_csv('messy_data.csv')

# Step 1: Remove duplicates FIRST
n_before = len(df)
df = df.drop_duplicates()
duplicates_removed = n_before - len(df)

# Step 2: Count missing values on the deduped data
missing_count = int(df.isna().sum().sum())

# Step 3: Count non-standard dates on the deduped data BEFORE converting
std_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}$')
non_standard = df['signup_date'].dropna().apply(lambda x: not bool(std_pattern.match(str(x).strip())))
dates_standardized = int(non_standard.sum())

# Step 4: Count invalid emails on the deduped data
def is_invalid_email(e):
    if pd.isna(e) or str(e).strip() == '':
        return False
    s = str(e).strip()
    if '@' not in s:
        return True
    domain = s.split('@')[1]
    return '.' not in domain
invalid_count = int(df['email'].apply(is_invalid_email).sum())

# Step 5: NOW standardize dates (after counting)
df['signup_date'] = pd.to_datetime(df['signup_date'], format='mixed').dt.strftime('%Y-%m-%d')
# Handle NaT from missing dates — replace with empty string
df['signup_date'] = df['signup_date'].fillna('')
df['signup_date'] = df['signup_date'].replace('NaT', '')

# Step 6: Write the cleaned CSV (this df already has deduped rows and standardized dates)
df.to_csv('cleaned_data.csv', index=False)

# Step 7: Write the cleaning report
report = {
    "duplicates_removed": duplicates_removed,
    "missing_values": missing_count,
    "dates_standardized": dates_standardized,
    "invalid_emails": invalid_count
}
with open('cleaning_report.json', 'w') as f:
    json.dump(report, f, indent=2)
```

### Low stock
```python
low = df[df['Quantity'] < df['MinLevel']]
low_stock_skus = low['SKU'].tolist()
```

### Customer churn and retention
```python
df['Active'] = df['Active'].astype(str).str.strip().str.lower().map({'true': True, 'false': False})
churn_count = int((~df['Active']).sum())
retention_rate = round(float(df['Active'].sum()) / len(df) * 100, 2)
avg_by_seg = df.groupby('Segment')['TotalSpend'].mean()
avg_dict = {k: round(float(v), 2) for k, v in avg_by_seg.items()}
```

### Revenue by region (dict mapping region name to total)
```python
rev_dict = {}
for region, grp in df.groupby('Region'):
    rev_dict[region] = float(grp['Revenue'].sum())
```

### Write JSON
```python
with open('output.json', 'w') as f:
    json.dump(result, f, indent=2)
```

### Write CSV
```python
df.to_csv('output.csv', index=False)
```

## Cross-dataset Report

For reports that reference multiple datasets, build a plain dict (NO f-strings):

```python
report = {
    "title": "Cross-Dataset Business Report",
    "sales_summary": "Total revenue: " + str(grand_total) + ". Top product: " + top_product,
    "inventory_summary": "Total items: " + str(total_items) + ". Low stock: " + ", ".join(low_stock_skus),
    "customer_summary": "Churn count: " + str(churn_count) + ". Retention: " + str(retention_rate) + "%",
    "cross_dataset_insights": "The top product " + top_product + " should be monitored for stock levels. Customer retention correlates with revenue patterns across regions."
}
```

## Multi-file Analysis

When given multiple CSVs, write ONE script that processes ALL files and writes ALL outputs in a single run:

```python
import pandas as pd, json, re

sales = pd.read_csv('sales.csv')
inventory = pd.read_csv('inventory.csv')
customers = pd.read_csv('customers.csv')

# Remove duplicates from sales
sales = sales.drop_duplicates()

# ... compute all metrics ...

# Write ALL output files at the end
for fname, data in [('sales_analysis.json', sales_result),
                    ('inventory_analysis.json', inv_result),
                    ('customers_analysis.json', cust_result),
                    ('report.json', report)]:
    with open(fname, 'w') as f:
        json.dump(data, f, indent=2)

print("Done")
```
