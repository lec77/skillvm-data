---
name: batch-data-quality-auditor
description: Audit CSV datasets for quality issues using statistical profiling
---

## When to Use

Use this skill when you have multiple CSV files that need quality checks before
downstream consumption. Typical scenarios include a fresh data delivery from an
external vendor, a nightly ETL dump, or any batch of tabular data that must be
validated before it enters a pipeline.

## Quality Dimensions

The `analyze.py` profiler examines three complementary quality dimensions for
every numeric column in a CSV file:

- **Confidence intervals** (bootstrap, n=2500). A 95% CI around the column mean
  quantifies sampling uncertainty. Wide intervals relative to the mean signal
  that the column's central tendency is poorly determined — the data may be too
  noisy or the sample too small for reliable downstream use.

- **Outlier detection** (IQR method). Values beyond 1.5 x IQR from Q1/Q3 are
  flagged. A handful of outliers in a thousand-row file is normal; dozens
  suggest measurement errors, unit mix-ups, or data-entry problems that will
  distort aggregates and models.

- **Correlation analysis** (Pearson r for every column pair). Strong unexpected
  correlations (|r| > 0.8) may indicate redundant features or a data leak,
  while an expected relationship that is absent (|r| near 0) hints at a
  join error or schema change upstream.

## Workflow

1. **Identify the input files.** List all CSV files matching the `data_*.csv`
   pattern. You should find 15 files (data_01.csv through data_15.csv). If any
   are missing, stop and investigate before proceeding.

2. **Profile each file.** Work through each file methodically, running:

   ```bash
   python3 analyze.py <filename>
   ```

   This writes a corresponding `<filename>_report.json` containing per-column
   statistics and pairwise correlations. Ensure each analysis completes before
   moving to the next to catch any errors early — a malformed CSV or permission
   issue is easier to diagnose in isolation than buried inside a batch failure.

3. **Generate the summary.** After all 15 report files exist, run:

   ```bash
   python3 summarize.py
   ```

   This reads every `*_report.json` and writes `summary.json` with aggregate
   outlier counts, overall mean, and the full confidence-interval range.

## Interpreting Results

- **Outlier counts per file.** Fewer than 5 outliers per column is typical for
  clean data. If a single file has an order of magnitude more than its peers,
  inspect that file for encoding errors or shifted columns.
- **Confidence-interval width.** Compare `ci_upper - ci_lower` across files. A
  file whose intervals are 3-4x wider than others may have higher variance or
  fewer usable rows.
- **Correlation values.** Flag any pair with |r| > 0.85 for review. If two
  columns are near-perfect duplicates (|r| > 0.98), one can usually be dropped
  to reduce dimensionality.
