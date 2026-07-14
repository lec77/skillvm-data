---
name: statistical-analysis
description: Conduct statistical hypothesis tests (t-test, ANOVA, chi-square), regression analysis, correlation, effect size calculations, and power analysis using Python. Use when analyzing experimental data, testing group differences, or building predictive models from tabular data.
---

# Statistical Analysis

**Workflow: Always write a single Python script file, then execute it with `python3`.**

Do NOT try to do analysis inline or in multiple steps. Write ONE complete script that:
1. Reads the data
2. Performs all analyses
3. Writes results to a JSON file

## Hypothesis Testing (ANOVA + Post-hoc)

When asked to compare groups, write and run this script pattern:

```python
import pandas as pd
import numpy as np
from scipy import stats
from statsmodels.stats.power import tt_ind_solve_power
import json
import math

def cohens_d(a, b):
    n_a, n_b = len(a), len(b)
    pooled_sd = np.sqrt(((n_a-1)*np.var(a, ddof=1) + (n_b-1)*np.var(b, ddof=1)) / (n_a+n_b-2))
    return (np.mean(a) - np.mean(b)) / pooled_sd

df = pd.read_csv('INPUT.csv')
groups = sorted(df['group'].unique())
data = {g: df[df['group'] == g]['score'].values for g in groups}

# Descriptives
descriptives = []
for g in groups:
    d = data[g]
    descriptives.append({"group": g, "mean": round(float(np.mean(d)), 4),
                         "std": round(float(np.std(d, ddof=1)), 4), "n": int(len(d))})

# ANOVA
f_stat, p_val = stats.f_oneway(*[data[g] for g in groups])
anova = {"f_statistic": round(float(f_stat), 4), "p_value": round(float(p_val), 6),
         "significant": bool(p_val < 0.05)}

# Post-hoc pairwise t-tests with Bonferroni
pairwise = []
n_comp = len(groups) * (len(groups) - 1) // 2
for i in range(len(groups)):
    for j in range(i+1, len(groups)):
        t, p = stats.ttest_ind(data[groups[i]], data[groups[j]])
        p_adj = min(float(p) * n_comp, 1.0)
        d = cohens_d(data[groups[i]], data[groups[j]])
        pairwise.append({"group1": groups[i], "group2": groups[j],
                         "t_statistic": round(float(t), 4), "p_value": round(float(p), 6),
                         "p_adjusted": round(p_adj, 6), "significant": bool(p_adj < 0.05),
                         "cohens_d": round(float(d), 4)})

# Power analysis for first pairwise comparison
ab = [x for x in pairwise if x["group1"] == groups[0] and x["group2"] == groups[1]]
es = abs(ab[0]["cohens_d"]) if ab else 0.5
n_req = tt_ind_solve_power(effect_size=es, alpha=0.05, power=0.80, ratio=1.0)
power_analysis = {"effect_size": round(es, 4), "required_n_per_group": int(math.ceil(n_req))}

results = {"descriptives": descriptives, "anova": anova, "pairwise": pairwise,
           "power_analysis": power_analysis}
with open("stats_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Done")
```

## Regression Analysis (OLS + VIF)

When asked to build regression models, write and run this script pattern:

```python
import pandas as pd
import numpy as np
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
import json

df = pd.read_csv('INPUT.csv')
target = 'price'  # adjust to actual target column
predictors = [c for c in df.columns if c != target]

# Correlations
correlations = df.corr().to_dict()

# OLS
X = df[predictors]
y = df[target]
X_c = sm.add_constant(X)
model = sm.OLS(y, X_c).fit()

model_info = {"r_squared": round(model.rsquared, 4), "adj_r_squared": round(model.rsquared_adj, 4),
              "f_statistic": round(float(model.fvalue), 4), "f_p_value": round(float(model.f_pvalue), 6)}

coefficients = []
for name, coef, se, pval in zip(model.params.index, model.params, model.bse, model.pvalues):
    coefficients.append({"variable": name, "coefficient": round(float(coef), 4),
                         "std_error": round(float(se), 4), "p_value": round(float(pval), 6),
                         "significant": bool(pval < 0.05)})

# VIF
vif = [{"variable": predictors[i], "vif_value": round(variance_inflation_factor(X.values, i), 4)}
       for i in range(len(predictors))]

# Prediction example
new_data = pd.DataFrame({'const': [1.0], **{p: [0] for p in predictors}})  # fill with actual values
predicted = model.predict(new_data)[0]
prediction = {"predicted_price": round(float(predicted), 2)}

results = {"correlations": correlations, "model": model_info, "coefficients": coefficients,
           "vif": vif, "prediction": prediction}
with open("regression_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Done")
```

## Key Reminders

- **Write the script to a .py file first, then run with `python3 script.py`**
- Use `scipy.stats.f_oneway` for ANOVA, `scipy.stats.ttest_ind` for t-tests
- Bonferroni correction: `p_adjusted = min(p_raw * n_comparisons, 1.0)`
- Cohen's d uses pooled standard deviation with `ddof=1`
- Power analysis: `statsmodels.stats.power.tt_ind_solve_power`
- VIF: `statsmodels.stats.outliers_influence.variance_inflation_factor`
- Always use `round()` on float outputs and `bool()` on significance flags
