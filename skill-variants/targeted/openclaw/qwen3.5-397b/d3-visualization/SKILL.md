---
name: d3-visualization
description: Build data visualizations as standalone HTML files with inline static SVG. Use when creating bar charts, line charts, scatter plots, or any SVG-based data visualization. Write SVG elements directly in HTML—no D3 library needed, no CDN.
---

# SVG Data Visualization

Build charts as self-contained HTML files with **static inline SVG**. No JavaScript libraries needed. No CDN links. No external dependencies.

## Critical Rules

1. **Always use relative file paths** — read `data.csv` not `/absolute/path/data.csv`
2. **No CDN links** — never reference cdn.jsdelivr.net, cdnjs.cloudflare.com, or unpkg.com
3. **No D3.js library needed** — compute SVG coordinates yourself and write static `<svg>` markup
4. **Write all SVG elements as literal HTML tags** — `<svg>`, `<rect>`, `<path>`, `<text>`, `<line>`, `<g>` must appear directly in the HTML source
5. **Self-contained** — the HTML file must work offline with zero network requests
6. **Output file** — write the result to `chart.html` in the current working directory

## Approach

1. Read the data file (CSV/JSON)
2. Parse the data mentally and compute coordinates
3. Write a single HTML file containing `<svg>` with all elements pre-computed as literal SVG tags
4. No `<script>` tags needed — pure static SVG

## Margins & Dimensions

Standard chart layout:
- SVG width/height as specified (default 800×500)
- Margins: top=40, right=30, bottom=60, left=80
- Inner chart area: translate by (left, top)

## Bar Chart

For N items with values, compute:
- **Bar width** = (innerWidth / N) × 0.8 (with 0.2 padding ratio)
- **Bar gap** = (innerWidth / N) × 0.2
- **Bar x** = left_margin + i × (innerWidth / N) + gap/2
- **Bar height** = value / maxValue × innerHeight
- **Bar y** = top_margin + innerHeight - barHeight

Use these colors for bars: `#1f77b4`, `#ff7f0e`, `#2ca02c`, `#d62728`, `#9467bd`, `#8c564b`, `#e377c2`, `#7f7f7f`, `#bcbd22`, `#17becf`

### Complete Bar Chart Example

Given data: A=100, B=200 with SVG 800×500, margins {top:40, right:30, bottom:60, left:80}:
- innerWidth = 800-80-30 = 690, innerHeight = 500-40-60 = 400
- maxValue = 200
- barStep = 690/2 = 345, barWidth = 345×0.8 = 276, gap = 345×0.2 = 69

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Product Revenue</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    text { font-size: 12px; }
    .title { font-size: 16px; font-weight: bold; }
    .axis line, .axis path { stroke: #333; fill: none; }
  </style>
</head>
<body>
<svg width="800" height="500">
  <!-- Title -->
  <text class="title" x="400" y="20" text-anchor="middle">Product Revenue</text>

  <!-- Chart area group translated by margins -->
  <g transform="translate(80,40)">
    <!-- Y axis -->
    <line x1="0" y1="0" x2="0" y2="400" stroke="#333"/>
    <text x="-10" y="400" text-anchor="end" dominant-baseline="middle">$0</text>
    <text x="-10" y="200" text-anchor="end" dominant-baseline="middle">$100</text>
    <text x="-10" y="0" text-anchor="end" dominant-baseline="middle">$200</text>
    <!-- Y axis label -->
    <text transform="rotate(-90)" x="-200" y="-50" text-anchor="middle">Revenue ($)</text>

    <!-- X axis -->
    <line x1="0" y1="400" x2="690" y2="400" stroke="#333"/>

    <!-- Bars -->
    <rect x="34.5" y="200" width="276" height="200" fill="#1f77b4"/>
    <text x="172.5" y="420" text-anchor="middle">A</text>

    <rect x="379.5" y="0" width="276" height="400" fill="#ff7f0e"/>
    <text x="517.5" y="420" text-anchor="middle">B</text>
  </g>
</svg>
</body>
</html>
```

## Line Chart

For timeseries data, compute:
- **x position** = left_margin + (dayIndex / (totalDays-1)) × innerWidth
- **y position** = top_margin + innerHeight - ((value - minValue) / (maxValue - minValue)) × innerHeight
- Build an SVG `<path>` with `d="M x0,y0 L x1,y1 L x2,y2 ..."` connecting all points
- Add ~6 date tick labels evenly spaced along x-axis

### Complete Line Chart Example

Given 5 data points: 2026-01-01=100, 2026-01-02=120, 2026-01-03=90, 2026-01-04=140, 2026-01-05=110 with SVG 800×400:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Trend</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    text { font-size: 12px; }
    .title { font-size: 16px; font-weight: bold; }
  </style>
</head>
<body>
<svg width="800" height="400">
  <text class="title" x="400" y="20" text-anchor="middle">Daily Trend</text>

  <g transform="translate(80,40)">
    <!-- Y axis -->
    <line x1="0" y1="0" x2="0" y2="300" stroke="#333"/>
    <text x="-10" y="300" text-anchor="end">90</text>
    <text x="-10" y="0" text-anchor="end">140</text>

    <!-- X axis -->
    <line x1="0" y1="300" x2="690" y2="300" stroke="#333"/>
    <text x="0" y="320" text-anchor="middle">2026-01-01</text>
    <text x="690" y="320" text-anchor="middle">2026-01-05</text>

    <!-- Line path -->
    <path d="M 0,240 L 172.5,120 L 345,300 L 517.5,0 L 690,180" fill="none" stroke="steelblue" stroke-width="2"/>
  </g>
</svg>
</body>
</html>
```

## Key Formulas

### Bar chart positioning (N bars)
```
step = innerWidth / N
barWidth = step * 0.8
gap = step * 0.1  (half padding on each side)
bar_x = gap + i * step
bar_height = (value / maxValue) * innerHeight
bar_y = innerHeight - bar_height
```

### Line chart positioning
```
x = (index / (count - 1)) * innerWidth
y = innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight
path_d = "M x0,y0 L x1,y1 L x2,y2 ..."
```

### Date tick labels (~6 ticks for line charts)
Space them evenly: indices 0, N/5, 2N/5, 3N/5, 4N/5, N-1

## Checklist Before Writing

- [ ] Read the data file using relative path
- [ ] Compute all SVG coordinates from the data
- [ ] Write `<svg>` element with correct width/height attributes
- [ ] Write `<rect>` elements for bars or `<path>` for lines as literal tags
- [ ] Include axis lines and labels
- [ ] Include chart title as `<text>` element
- [ ] Include all data labels (product names, dates containing year)
- [ ] No CDN URLs anywhere in the file
- [ ] No `<script>` tags referencing external JS
- [ ] File saved as `chart.html` in current directory
