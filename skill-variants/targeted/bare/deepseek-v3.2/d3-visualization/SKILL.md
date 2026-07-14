---
name: d3-visualization
description: Build data visualizations as standalone HTML files with SVG. Use when creating bar charts, line charts, or any SVG-based data visualization.
---

# D3.js Visualization — MANDATORY Instructions

**Output file MUST be named `chart.html`**. Never use any other filename.

**NEVER include CDN URLs** (no cdn.jsdelivr.net, cdnjs.cloudflare.com, unpkg.com) in the final HTML.

## Detecting Chart Type

- If the prompt mentions "bar chart" or data has categories/products → use **Bar Chart** method
- If the prompt mentions "line chart" or data has dates/timeseries → use **Line Chart** method

---

## BAR CHART METHOD

**DO NOT use D3 for bar charts.** Write pure static SVG with pre-computed coordinates.

### Step 1: Read the CSV file to get data items and values

### Step 2: Compute bar positions

Given N items and maxValue (the largest value):
- SVG: width=800, height=500
- margins: top=40, right=30, bottom=60, left=80
- innerWidth = 800 - 80 - 30 = 690
- innerHeight = 500 - 40 - 60 = 400
- slotWidth = 690 / N
- barWidth = slotWidth * 0.8

For each item i (0-indexed):
- x = 80 + i * slotWidth + slotWidth * 0.1
- barHeight = (value / maxValue) * 400
- y = 40 + (400 - barHeight)
- labelX = 80 + i * slotWidth + slotWidth / 2
- labelY = 460

### Step 3: Write chart.html with literal `<svg>`, `<rect>`, and `<text>` tags

Use these colors in order: #1f77b4, #ff7f0e, #2ca02c, #d62728, #9467bd, #8c564b, #e377c2, #7f7f7f, #bcbd22, #17becf

Example for 2 items (A=100, B=200, maxValue=200, N=2, slotWidth=345):

```html
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Product Revenue</title></head>
<body>
<svg width="800" height="500">
<text x="400" y="25" text-anchor="middle" font-size="16" font-weight="bold">Product Revenue</text>
<text x="25" y="270" text-anchor="middle" font-size="13" transform="rotate(-90,25,270)">Revenue ($)</text>
<line x1="80" y1="40" x2="80" y2="440" stroke="#333"/>
<line x1="80" y1="440" x2="770" y2="440" stroke="#333"/>
<rect x="114.5" y="240" width="276" height="200" fill="#1f77b4"/>
<text x="252.5" y="460" text-anchor="middle" font-size="11">A</text>
<rect x="459.5" y="40" width="276" height="400" fill="#ff7f0e"/>
<text x="597.5" y="460" text-anchor="middle" font-size="11">B</text>
</svg>
</body></html>
```

**IMPORTANT:** Every product name from the CSV MUST appear as a `<text>` element. Every value MUST have a corresponding `<rect>` element. There must be exactly N `<rect>` elements for N data rows.

---

## LINE CHART METHOD

For line charts, download D3 to compute the path, but ensure the HTML source contains literal `<svg>` and `<path>` tags.

### Step 1: Read the CSV file

### Step 2: Download D3
```bash
curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js
```

### Step 3: Write chart.html

The HTML source MUST contain these literal tags:
- `<svg` — the SVG container
- `<path` — the line path element (with empty d="" that D3 fills at runtime)
- Text containing the year from the data (e.g. "2026")
- Text containing the chart title

**CRITICAL:** Embed ALL CSV rows in the JavaScript string. Do not skip any rows.

```html
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Daily Trend</title></head>
<body>
<svg id="chart" width="800" height="400">
<text x="400" y="25" text-anchor="middle" font-size="16" font-weight="bold">Daily Trend</text>
<g id="plotarea" transform="translate(60,40)">
<path id="trendline" fill="none" stroke="steelblue" stroke-width="2" d=""/>
</g>
<text x="60" y="390" font-size="10">2026-01-01</text>
<text x="770" y="390" font-size="10" text-anchor="end">2026-03-31</text>
<line x1="60" y1="340" x2="770" y2="340" stroke="#333"/>
<line x1="60" y1="40" x2="60" y2="340" stroke="#333"/>
</svg>
<script src="d3.min.js"></script>
<script>
const csvText = `date,value
2026-01-01,100
2026-01-02,105`;

const parseDate = d3.timeParse("%Y-%m-%d");
const data = d3.csvParse(csvText, d => ({date: parseDate(d.date), value: +d.value}));
const innerWidth = 710, innerHeight = 300;
const xScale = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, innerWidth]);
const yScale = d3.scaleLinear().domain([d3.min(data, d => d.value)*0.9, d3.max(data, d => d.value)*1.1]).range([innerHeight, 0]);
const line = d3.line().x(d => xScale(d.date)).y(d => yScale(d.value)).curve(d3.curveMonotoneX);
d3.select("#trendline").attr("d", line(data));
</script>
</body></html>
```

Replace the csvText content with ALL rows from the actual CSV file. Update date labels and chart title to match the task.
