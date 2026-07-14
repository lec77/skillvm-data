---
name: statistical-analysis
description: Statistical analysis in Python. ANOVA, t-tests, regression, effect sizes, power analysis. Use scipy.stats and statsmodels.
---

# Statistical Analysis

All required packages (numpy, pandas, scipy, statsmodels) are already installed. Do NOT run pip install.

## Workflow

1. Use `read_file` to read the CSV data
2. Use `write_file` to write a Python script (e.g., `analysis.py`)
3. Use `execute_command` to run: `python analysis.py`
4. Verify the output JSON was created

## ANOVA with Post-Hoc Tests

When asked to compare groups and run ANOVA, write this script:

```python
import pandas as pd
import numpy as np
from scipy import stats
from statsmodels.stats.power import tt_ind_solve_power
import json, math

df = pd.read_csv('experiment_data.csv')
groups = df.groupby('group')

# Descriptives
descriptives = []
for name, g in groups:
    descriptives.append({
        "group": name,
        "mean": round(float(g['score'].mean()), 4),
        "std": round(float(g['score'].std(ddof=1)), 4),
        "n": int(len(g))
    })

# ANOVA
group_data = [g['score'].values for _, g in groups]
f_stat, p_value = stats.f_oneway(*group_data)

# Pairwise t-tests with Bonferroni
names = sorted(df['group'].unique())
n_tests = len(names) * (len(names) - 1) // 2
pairwise = []
for i in range(len(names)):
    for j in range(i+1, len(names)):
        a = df[df['group'] == names[i]]['score'].values
        b = df[df['group'] == names[j]]['score'].values
        t, p = stats.ttest_ind(a, b)
        p_adj = min(p * n_tests, 1.0)
        n_a, n_b = len(a), len(b)
        pooled = np.sqrt(((n_a-1)*np.var(a,ddof=1)+(n_b-1)*np.var(b,ddof=1))/(n_a+n_b-2))
        d = (np.mean(a) - np.mean(b)) / pooled
        pairwise.append({
            "group1": names[i], "group2": names[j],
            "t_statistic": round(float(t), 4),
            "p_value": round(float(p), 6),
            "p_adjusted": round(float(p_adj), 6),
            "significant": bool(p_adj < 0.05),
            "cohens_d": round(float(d), 4)
        })

# Power analysis using A-B Cohen's d
ab = [p for p in pairwise if p['group1'] == 'A' and p['group2'] == 'B'][0]
es = abs(ab['cohens_d'])
n_req = tt_ind_solve_power(effect_size=es, alpha=0.05, power=0.80, ratio=1.0)

results = {
    "descriptives": descriptives,
    "anova": {
        "f_statistic": round(float(f_stat), 4),
        "p_value": round(float(p_value), 6),
        "significant": bool(p_value < 0.05)
    },
    "pairwise": pairwise,
    "power_analysis": {
        "effect_size": round(float(es), 4),
        "required_n_per_group": int(math.ceil(n_req))
    }
}

with open('stats_results.json', 'w') as f:
    json.dump(results, f, indent=2)
print("Done: stats_results.json written")
```

## Multiple Linear Regression

When asked to build a regression model, write this script:

```python
import pandas as pd
import numpy as np
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
import json

df = pd.read_csv('housing_data.csv')
target = 'price'
predictors = [c for c in df.columns if c != target]

# Correlation matrix
corr = df.corr()
correlations = {c: {c2: round(float(corr.loc[c, c2]), 4) for c2 in corr.columns} for c in corr.index}

# OLS regression
X = df[predictors]
y = df[target]
X_const = sm.add_constant(X)
model = sm.OLS(y, X_const).fit()

# Coefficients
coefficients = []
for var in predictors:
    coefficients.append({
        "variable": var,
        "coefficient": round(float(model.params[var]), 4),
        "std_error": round(float(model.bse[var]), 4),
        "p_value": round(float(model.pvalues[var]), 6),
        "significant": bool(model.pvalues[var] < 0.05)
    })

# VIF
vif = []
for i, col in enumerate(predictors):
    vif.append({
        "variable": col,
        "vif_value": round(float(variance_inflation_factor(X.values, i)), 4)
    })

# Prediction for sqft=2000, bedrooms=3, age=20
pred_input = pd.DataFrame([[1, 2000, 3, 20]], columns=['const'] + predictors)
predicted = model.predict(pred_input)[0]

results = {
    "correlations": correlations,
    "model": {
        "r_squared": round(float(model.rsquared), 4),
        "adj_r_squared": round(float(model.rsquared_adj), 4),
        "f_statistic": round(float(model.fvalue), 4),
        "f_p_value": round(float(model.f_pvalue), 6)
    },
    "coefficients": coefficients,
    "vif": vif,
    "prediction": {
        "predicted_price": round(float(predicted), 2)
    }
}

with open('regression_results.json', 'w') as f:
    json.dump(results, f, indent=2)
print("Done: regression_results.json written")
```
