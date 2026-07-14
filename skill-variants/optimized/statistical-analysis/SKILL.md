---
name: statistical-analysis
description: Conduct statistical hypothesis tests (t-test, ANOVA, chi-square), regression analysis, correlation, effect size calculations, and power analysis using Python. Use when analyzing experimental data, testing group differences, or building predictive models from tabular data.
---

# Statistical Analysis

Python statistical analysis using scipy.stats and statsmodels. Always use `python3` (not `python`).

## Test Selection

- **2 groups** → `stats.ttest_ind(a, b)` (use `equal_var=False` for Welch's if variances differ)
- **3+ groups** → `stats.f_oneway(g1, g2, g3)` then post-hoc pairwise t-tests if significant
- **Categorical** → `stats.chi2_contingency(table)`
- **Continuous relationships** → `stats.pearsonr(x, y)` / OLS regression

## ANOVA + Post-Hoc Pipeline

```python
from scipy import stats
import numpy as np

# One-way ANOVA
f_stat, p_value = stats.f_oneway(g1, g2, g3)

# Post-hoc pairwise t-tests with Bonferroni correction
groups = [("A", g1), ("B", g2), ("C", g3)]
n_tests = 3  # number of pairwise comparisons
for i in range(len(groups)):
    for j in range(i+1, len(groups)):
        t, p = stats.ttest_ind(groups[i][1], groups[j][1])
        p_adj = min(p * n_tests, 1.0)  # Bonferroni
```

## Cohen's d (Effect Size for t-tests)

```python
def cohens_d(a, b):
    n_a, n_b = len(a), len(b)
    pooled_sd = np.sqrt(((n_a-1)*np.var(a, ddof=1) + (n_b-1)*np.var(b, ddof=1)) / (n_a+n_b-2))
    return (np.mean(a) - np.mean(b)) / pooled_sd
```

Benchmarks: small=0.2, medium=0.5, large=0.8

## Power Analysis

```python
from statsmodels.stats.power import tt_ind_solve_power
import math
n = math.ceil(tt_ind_solve_power(effect_size=d, alpha=0.05, power=0.80, ratio=1.0))
```

## Multiple Linear Regression (OLS)

```python
import statsmodels.api as sm

X = sm.add_constant(X_predictors)  # adds intercept
model = sm.OLS(y, X).fit()
print(model.summary())
# Key: model.rsquared, model.rsquared_adj, model.fvalue, model.f_pvalue
# Coefficients: model.params, model.pvalues, model.bse (std errors)
# Predict: model.predict(sm.add_constant(new_X))
```

## VIF (Multicollinearity Check)

```python
from statsmodels.stats.outliers_influence import variance_inflation_factor
import pandas as pd

vif = pd.DataFrame({
    "variable": X.columns,
    "vif_value": [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
})
# VIF > 10 = problematic multicollinearity
```

## JSON Output Format

Always write results to JSON. Structure by analysis type:

```python
import json
results = {
    "descriptives": [{"group": "A", "mean": float, "std": float, "n": int}],
    "anova": {"f_statistic": float, "p_value": float, "significant": bool},
    "pairwise": [{"group1": str, "group2": str, "t_statistic": float,
                   "p_value": float, "p_adjusted": float, "significant": bool, "cohens_d": float}],
    "power_analysis": {"effect_size": float, "required_n_per_group": int},
    "correlations": {},  # variable-to-variable correlation matrix
    "model": {"r_squared": float, "adj_r_squared": float, "f_statistic": float, "f_p_value": float},
    "coefficients": [{"variable": str, "coefficient": float, "std_error": float, "p_value": float, "significant": bool}],
    "vif": [{"variable": str, "vif_value": float}],
    "prediction": {"predicted_price": float}
}
with open("results.json", "w") as f:
    json.dump(results, f, indent=2)
```
