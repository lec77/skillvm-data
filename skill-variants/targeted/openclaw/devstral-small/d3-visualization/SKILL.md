---
name: d3-visualization
description: Create chart.html files with inline SVG. Charts use pure HTML+SVG, no JavaScript. Read CSV first, compute positions, write rect/path/text SVG elements directly in HTML body.
---

# Creating Charts — Pure SVG, No JavaScript

## THE ONE RULE: No `<script>` tags. Ever. Not for D3, not for anything. Pure HTML+SVG only.

Even though the task mentions "D3.js", the correct output is a static SVG chart with zero JavaScript. This is important — do NOT add any `<script>` tags to chart.html.

## Line Chart (from date,value CSV)

A line chart is a single `<path>` element inside `<svg>`. Even with 90+ data points, this is just one long path string. No JavaScript needed.

### Step 1: Read the CSV file

### Step 2: Compute path coordinates

SVG 800x400. Margins: left=60, top=30, right=30, bottom=40.
- innerW = 710, innerH = 330
- Find minVal and maxVal from all values

For each row i (0-indexed) with value v among N total rows:
- x = 60 + (i / (N-1)) * 710
- y = 30 + 330 - ((v - minVal) / (maxVal - minVal)) * 330

Round x and y to 1 decimal place.

### Step 3: Write chart.html with this EXACT structure

```
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Daily Trend</title></head>
<body>
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
<text x="400" y="20" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif">Daily Trend</text>
<line x1="60" y1="30" x2="60" y2="360" stroke="#333" stroke-width="1"/>
<line x1="60" y1="360" x2="770" y2="360" stroke="#333" stroke-width="1"/>
<path d="M 60,360 L 67.9,330 L 75.8,312 L 83.7,290 L ..." fill="none" stroke="steelblue" stroke-width="2"/>
<text x="60" y="378" text-anchor="middle" font-size="10" font-family="sans-serif">2026-01-01</text>
<text x="202" y="378" text-anchor="middle" font-size="10" font-family="sans-serif">2026-01-19</text>
<text x="344" y="378" text-anchor="middle" font-size="10" font-family="sans-serif">2026-02-06</text>
<text x="486" y="378" text-anchor="middle" font-size="10" font-family="sans-serif">2026-02-24</text>
<text x="628" y="378" text-anchor="middle" font-size="10" font-family="sans-serif">2026-03-14</text>
<text x="770" y="378" text-anchor="middle" font-size="10" font-family="sans-serif">2026-03-31</text>
</svg>
</body>
</html>
```

The `<path d="M x0,y0 L x1,y1 L x2,y2 ..."/>` contains ALL data points as coordinates. For 90 points, the d attribute will be long — that's normal and correct.

### Date label positions

Show 6 labels. For N=91 data points, use indices 0, 18, 36, 54, 72, 90 and compute their x positions.

## Bar Chart (from product,revenue CSV)

### Step 1: Read the CSV file

### Step 2: Compute bar positions

SVG 800x500. Margins: left=80, top=40, right=30, bottom=60.
- innerW = 690, innerH = 400
- N = number of products
- step = 690 / N
- barW = step * 0.8
- pad = step * 0.1
- maxVal = highest revenue

For product i (0-indexed) with revenue v:
- x = 80 + i * step + pad
- height = (v / maxVal) * 400
- y = 40 + (400 - height)
- label_x = 80 + i * step + step/2

Colors: #1f77b4, #ff7f0e, #2ca02c, #d62728, #9467bd, #8c564b, #e377c2, #7f7f7f, #bcbd22, #17becf

### Step 3: Write chart.html with this EXACT structure

```
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Product Revenue</title></head>
<body>
<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
<text x="400" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif">Product Revenue</text>
<text transform="rotate(-90)" x="-240" y="20" text-anchor="middle" font-size="12" font-family="sans-serif">Revenue ($)</text>
<line x1="80" y1="40" x2="80" y2="440" stroke="#333" stroke-width="1"/>
<line x1="80" y1="440" x2="770" y2="440" stroke="#333" stroke-width="1"/>
<rect x="X" y="Y" width="W" height="H" fill="COLOR"/>
<text x="LX" y="460" text-anchor="middle" font-size="10" font-family="sans-serif">ProductName</text>
...repeat rect+text for each product...
</svg>
</body>
</html>
```

## CRITICAL RULES

1. **ZERO `<script>` tags** in chart.html. No JavaScript whatsoever. Not D3, not inline, nothing.
2. **Read the CSV first** — use the read tool. Never fabricate data.
3. **All chart elements are static SVG** — `<svg>`, `<rect>`, `<path>`, `<text>`, `<line>` written directly.
4. **No external files** — no .js files, no CDN URLs (cdn.jsdelivr.net, cdnjs.cloudflare.com, unpkg.com).
5. **Output file must be named `chart.html`.**
6. **Date labels must include the year** from the CSV (e.g., "2026-01-15").
7. **Every product from the CSV must have its own `<rect>` element.**
