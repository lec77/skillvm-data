---
name: statistical-analysis
description: Conduct statistical hypothesis tests (t-test, ANOVA, chi-square), regression analysis, correlation, effect size calculations, and power analysis using Python. Use when analyzing experimental data, testing group differences, or building predictive models from tabular data.
---

# Statistical Analysis

Python statistical analysis with scipy.stats and statsmodels. Use `python3`.

## Hypothesis Testing Pipeline

```python
from scipy import stats
import numpy as np, json, math

# ANOVA for 3+ groups
f_stat, p_value = stats.f_oneway(g1, g2, g3)

# Post-hoc pairwise t-tests with Bonferroni correction
groups = [("A", g1), ("B", g2), ("C", g3)]
n_tests = 3
pairwise = []
for i in range(len(groups)):
    for j in range(i+1, len(groups)):
        t, p = stats.ttest_ind(groups[i][1], groups[j][1])
        p_adj = min(p * n_tests, 1.0)
        d = cohens_d(groups[i][1], groups[j][1])
        pairwise.append({"group1": groups[i][0], "group2": groups[j][0],
            "t_statistic": round(float(t), 4), "p_value": round(float(p), 6),
            "p_adjusted": round(float(p_adj), 6), "significant": bool(p_adj < 0.05),
            "cohens_d": round(float(d), 4)})

# Cohen's d
def cohens_d(a, b):
    n_a, n_b = len(a), len(b)
    pooled_sd = np.sqrt(((n_a-1)*np.var(a, ddof=1) + (n_b-1)*np.var(b, ddof=1)) / (n_a+n_b-2))
    return (np.mean(a) - np.mean(b)) / pooled_sd

# Power analysis
from statsmodels.stats.power import tt_ind_solve_power
n = math.ceil(tt_ind_solve_power(effect_size=abs(d), alpha=0.05, power=0.80, ratio=1.0))
```

## OLS Regression Pipeline

```python
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
import pandas as pd

X = sm.add_constant(df[["sqft", "bedrooms", "age"]])
model = sm.OLS(df["price"], X).fit()
# model.rsquared, model.rsquared_adj, model.fvalue, model.f_pvalue
# model.params, model.pvalues, model.bse

# VIF
vif = [{"variable": col, "vif_value": round(float(variance_inflation_factor(
    df[["sqft","bedrooms","age"]].values, i)), 4)}
    for i, col in enumerate(["sqft","bedrooms","age"])]

# Prediction
pred = model.predict(sm.add_constant(pd.DataFrame({"sqft":[2000],"bedrooms":[3],"age":[20]})))
```

## JSON Output Templates

**Hypothesis testing** → `stats_results.json`:
```json
{
  "descriptives": [{"group": "A", "mean": 0.0, "std": 0.0, "n": 30}],
  "anova": {"f_statistic": 0.0, "p_value": 0.0, "significant": true},
  "pairwise": [{"group1": "A", "group2": "B", "t_statistic": 0.0, "p_value": 0.0, "p_adjusted": 0.0, "significant": true, "cohens_d": 0.0}],
  "power_analysis": {"effect_size": 0.0, "required_n_per_group": 0}
}
```

**Regression** → `regression_results.json`:
```json
{
  "correlations": [[1.0]],
  "model": {"r_squared": 0.0, "adj_r_squared": 0.0, "f_statistic": 0.0, "f_p_value": 0.0},
  "coefficients": [{"variable": "const", "coefficient": 0.0, "std_error": 0.0, "p_value": 0.0, "significant": true}],
  "vif": [{"variable": "sqft", "vif_value": 0.0}],
  "prediction": {"predicted_price": 0.0}
}
```
