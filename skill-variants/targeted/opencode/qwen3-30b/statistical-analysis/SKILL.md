---
name: statistical-analysis
description: Conduct statistical hypothesis tests (t-test, ANOVA, chi-square), regression analysis, correlation, effect size calculations, and power analysis using Python. Use when analyzing experimental data, testing group differences, or building predictive models from tabular data.
---

# Statistical Analysis

Python statistical analysis using scipy.stats and statsmodels. Always use `python3` (not `python`).

## CRITICAL: Ignore LSP/type-checker warnings

After writing a Python file, the editor may show LSP diagnostics (pyright type errors). These are FALSE POSITIVES caused by incomplete type stubs for pandas/numpy/statsmodels. DO NOT attempt to fix them. Just run the script with `python3 script.py`. If the script executes successfully, the task is done.

## Test Selection

- **2 groups** → `stats.ttest_ind(a, b)`
- **3+ groups** → `stats.f_oneway(g1, g2, g3)` then post-hoc pairwise t-tests if significant
- **Categorical** → `stats.chi2_contingency(table)`
- **Continuous relationships** → `stats.pearsonr(x, y)` / OLS regression

## Complete ANOVA + Post-Hoc + Power Analysis Template

Write this as a single script and run it once. Do not edit after seeing LSP warnings.

```python
import pandas as pd
import numpy as np
from scipy import stats
from statsmodels.stats.power import tt_ind_solve_power
import math, json

data = pd.read_csv("experiment_data.csv")

# Descriptive stats
descriptives = []
group_data = {}
for grp in sorted(data["group"].unique()):
    scores = data[data["group"] == grp]["score"]
    group_data[grp] = list(scores)
    descriptives.append({
        "group": grp,
        "mean": round(float(scores.mean()), 4),
        "std": round(float(scores.std(ddof=1)), 4),
        "n": int(len(scores))
    })

# ANOVA
f_stat, p_value = stats.f_oneway(*[np.array(v) for v in group_data.values()])

# Pairwise t-tests with Bonferroni + Cohen's d
keys = sorted(group_data.keys())
n_tests = len(keys) * (len(keys) - 1) // 2
pairwise = []
for i in range(len(keys)):
    for j in range(i + 1, len(keys)):
        a = np.array(group_data[keys[i]])
        b = np.array(group_data[keys[j]])
        t, p = stats.ttest_ind(a, b)
        p_adj = min(float(p) * n_tests, 1.0)
        n_a, n_b = len(a), len(b)
        pooled_sd = np.sqrt(((n_a-1)*np.var(a, ddof=1) + (n_b-1)*np.var(b, ddof=1)) / (n_a+n_b-2))
        d = float((np.mean(a) - np.mean(b)) / pooled_sd)
        pairwise.append({
            "group1": keys[i], "group2": keys[j],
            "t_statistic": round(float(t), 4),
            "p_value": round(float(p), 6),
            "p_adjusted": round(p_adj, 6),
            "significant": bool(p_adj < 0.05),
            "cohens_d": round(d, 4)
        })

# Power analysis — effect_size MUST be positive (use abs)
ab = [pw for pw in pairwise if pw["group1"] == "A" and pw["group2"] == "B"][0]
effect_size = abs(ab["cohens_d"])
n_per_group = math.ceil(tt_ind_solve_power(effect_size=effect_size, alpha=0.05, power=0.80, ratio=1.0))

results = {
    "descriptives": descriptives,
    "anova": {"f_statistic": round(float(f_stat), 4), "p_value": round(float(p_value), 6), "significant": bool(p_value < 0.05)},
    "pairwise": pairwise,
    "power_analysis": {"effect_size": round(effect_size, 4), "required_n_per_group": n_per_group}
}
with open("stats_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Done. Results saved to stats_results.json")
```

## Complete Regression Template

Write this as a single script and run it once. Do not edit after seeing LSP warnings.

```python
import pandas as pd
import numpy as np
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
import json

data = pd.read_csv("housing_data.csv")
predictors = ["sqft", "bedrooms", "age"]
target = "price"

# Correlation matrix
corr = data[predictors + [target]].corr()
correlations = {}
for col in corr.columns:
    correlations[col] = {c: round(float(corr.loc[col, c]), 4) for c in corr.columns}

# VIF on raw predictors (no constant)
X_raw = data[predictors].values
vif_results = []
for i, col in enumerate(predictors):
    vif_val = variance_inflation_factor(X_raw, i)
    vif_results.append({"variable": col, "vif_value": round(float(vif_val), 4)})

# OLS regression
X = sm.add_constant(data[predictors])
y = data[target]
model = sm.OLS(y, X).fit()

coefficients = []
for var in model.params.index:
    if var == "const":
        continue
    coefficients.append({
        "variable": var,
        "coefficient": round(float(model.params[var]), 4),
        "std_error": round(float(model.bse[var]), 4),
        "p_value": round(float(model.pvalues[var]), 6),
        "significant": bool(model.pvalues[var] < 0.05)
    })

# Prediction
new_data = np.array([[1.0, 2000, 3, 20]])  # const, sqft, bedrooms, age
predicted_price = float(model.predict(new_data)[0])

results = {
    "correlations": correlations,
    "model": {
        "r_squared": round(float(model.rsquared), 4),
        "adj_r_squared": round(float(model.rsquared_adj), 4),
        "f_statistic": round(float(model.fvalue), 4),
        "f_p_value": round(float(model.f_pvalue), 6)
    },
    "coefficients": coefficients,
    "vif": vif_results,
    "prediction": {"predicted_price": round(predicted_price, 2)}
}
with open("regression_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Done. Results saved to regression_results.json")
```
