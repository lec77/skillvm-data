---
name: statistical-analysis
description: Conduct statistical hypothesis tests (t-test, ANOVA, chi-square), regression analysis, correlation, effect size calculations, and power analysis using Python. Use when analyzing experimental data, testing group differences, or building predictive models from tabular data.
---

# Statistical Analysis

Perform rigorous statistical analysis in Python using scipy.stats and statsmodels. Covers hypothesis testing, regression, effect sizes, and power analysis.

## Test Selection Guide

- **Comparing 2 groups** → independent t-test (or paired t-test if same subjects measured twice)
- **Comparing 3+ groups** → one-way ANOVA, then post-hoc pairwise tests if significant
- **Categorical data** → chi-square test of independence
- **Relationships between continuous variables** → Pearson correlation / linear regression
- **Predicting from multiple predictors** → multiple linear regression (OLS)

## Assumption Checking

Before running tests, verify assumptions:

```python
from scipy import stats

# Normality (Shapiro-Wilk — use for n < 50; for larger samples use visual inspection)
stat, p = stats.shapiro(data)
print(f"Shapiro-Wilk: W={stat:.4f}, p={p:.4f}")
# p > 0.05 → assume normality

# Homogeneity of variance (Levene's test — use before t-test or ANOVA)
stat, p = stats.levene(group1, group2, group3)
print(f"Levene's: W={stat:.4f}, p={p:.4f}")
# p > 0.05 → variances are homogeneous

# Linearity — check scatter plot or correlation before regression
```

## Implementation Patterns

### Independent t-test

```python
from scipy import stats

t_stat, p_value = stats.ttest_ind(group_a, group_b)
print(f"t({len(group_a)+len(group_b)-2}) = {t_stat:.4f}, p = {p_value:.4f}")
# Use equal_var=False (Welch's) if variances differ
t_stat, p_value = stats.ttest_ind(group_a, group_b, equal_var=False)
```

### Paired t-test

```python
t_stat, p_value = stats.ttest_rel(before, after)
print(f"t({len(before)-1}) = {t_stat:.4f}, p = {p_value:.4f}")
```

### One-way ANOVA

```python
f_stat, p_value = stats.f_oneway(group1, group2, group3)
print(f"F({len(groups)-1}, {total_n - len(groups)}) = {f_stat:.4f}, p = {p_value:.4f}")
```

### Chi-square test

```python
import numpy as np

# Build contingency table
table = np.array([[observed_a1, observed_a2],
                  [observed_b1, observed_b2]])
chi2, p, dof, expected = stats.chi2_contingency(table)
print(f"chi2({dof}) = {chi2:.4f}, p = {p:.4f}")
```

### Pearson Correlation

```python
r, p_value = stats.pearsonr(x, y)
print(f"r = {r:.4f}, p = {p_value:.4f}")
```

### Multiple Linear Regression (OLS)

```python
import statsmodels.api as sm

X = sm.add_constant(X_predictors)   # adds intercept column
model = sm.OLS(y, X).fit()
print(model.summary())

# Extract key results
print(f"R-squared: {model.rsquared:.4f}")
print(f"Adj. R-squared: {model.rsquared_adj:.4f}")
print(f"F-statistic: {model.fvalue:.4f}, p = {model.f_pvalue:.4f}")
for name, coef, pval in zip(model.params.index, model.params, model.pvalues):
    print(f"  {name}: coef={coef:.4f}, p={pval:.4f}")
```

## Effect Sizes

Effect sizes quantify practical significance (not just statistical significance).

### Cohen's d (for t-tests)

```python
import numpy as np

def cohens_d(a, b):
    n_a, n_b = len(a), len(b)
    pooled_sd = np.sqrt(((n_a-1)*np.var(a, ddof=1) + (n_b-1)*np.var(b, ddof=1)) / (n_a+n_b-2))
    return (np.mean(a) - np.mean(b)) / pooled_sd

d = cohens_d(group_a, group_b)
```

**Benchmarks**: small = 0.2, medium = 0.5, large = 0.8

### Eta-squared (for ANOVA)

```python
# SS_between / SS_total
grand_mean = np.mean(np.concatenate([g1, g2, g3]))
ss_between = sum(len(g) * (np.mean(g) - grand_mean)**2 for g in [g1, g2, g3])
ss_total = sum((x - grand_mean)**2 for g in [g1, g2, g3] for x in g)
eta_sq = ss_between / ss_total
```

**Benchmarks**: small = 0.01, medium = 0.06, large = 0.14

### r as effect size (for correlations)

**Benchmarks**: small = 0.1, medium = 0.3, large = 0.5

## Multiple Comparison Correction

When running k pairwise tests after ANOVA, apply Bonferroni correction:

```python
n_tests = 3   # e.g., 3 pairwise comparisons for 3 groups
p_adjusted = min(p_raw * n_tests, 1.0)
significant = p_adjusted < 0.05
```

## Power Analysis

```python
from statsmodels.stats.power import tt_ind_solve_power
import math

# IMPORTANT: effect_size must be positive (use abs value of Cohen's d)
effect_size = abs(cohens_d)
n_per_group = tt_ind_solve_power(
    effect_size=effect_size,
    alpha=0.05,
    power=0.80,
    ratio=1.0               # equal group sizes
)

power_analysis = {
    "effect_size": round(float(effect_size), 4),  # always positive
    "required_n_per_group": int(math.ceil(n_per_group))
}
```

## Variance Inflation Factor (VIF)

Detect multicollinearity in regression:

```python
from statsmodels.stats.outliers_influence import variance_inflation_factor
import pandas as pd

vif_data = pd.DataFrame()
vif_data["variable"] = X.columns
vif_data["VIF"] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
# VIF > 10 indicates problematic multicollinearity
```

## APA Reporting Format

- t-test: `t(df) = X.XX, p = .XXX, d = X.XX`
- ANOVA: `F(df_between, df_within) = X.XX, p = .XXX, η² = X.XX`
- Correlation: `r(df) = X.XX, p = .XXX`
- Regression: `R² = X.XX, F(df_reg, df_res) = X.XX, p = .XXX`

## Common Output Format (JSON)

```python
import json

results = {
    "descriptives": [
        {"group": "A", "mean": round(float(np.mean(gA)), 4), "std": round(float(np.std(gA, ddof=1)), 4), "n": len(gA)}
    ],
    "anova": {
        "f_statistic": round(float(f_stat), 4),
        "p_value": round(float(p_value), 6),
        "significant": bool(p_value < 0.05)
    },
    "pairwise": [
        {"group1": "A", "group2": "B", "t_statistic": round(float(t), 4),
         "p_value": round(float(p), 6), "p_adjusted": round(float(p_adj), 6),
         "significant": bool(p_adj < 0.05), "cohens_d": round(float(d), 4)}
    ]
}

with open("stats_results.json", "w") as f:
    json.dump(results, f, indent=2)
```
