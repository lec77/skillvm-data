---
name: d3-visualization
description: Build data visualizations with D3.js as standalone HTML files. Use when creating bar charts, line charts, scatter plots, or any SVG-based data visualization. Always vendor D3 locally, never use CDN.
---

# D3.js Visualization

Build self-contained HTML chart files with D3.js v7. All files must work offline — never use CDN.

## Step-by-step Process

1. Read the input data file (CSV/JSON)
2. Download D3 locally: `curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js`
3. Write `chart.html` with **static pre-computed SVG** (see below)

## CRITICAL: Use Static SVG

The HTML source MUST contain literal `<svg>`, `<rect>`, `<path>`, `<text>` tags.

**D3's `.append("rect")` and `.append("path")` create elements at runtime — they will NOT appear in the HTML source.** You MUST pre-compute all coordinates from the data and write static SVG directly.

## Bar Chart Template

Read CSV data, compute bar positions, write this structure:

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Chart</title>
<style>body { font-family: sans-serif; margin: 20px; }</style>
</head>
<body>
<script src="d3.min.js"></script>
<svg width="800" height="500">
  <text x="400" y="20" text-anchor="middle" font-size="16" font-weight="bold">TITLE HERE</text>
  <g transform="translate(80,40)">
    <line x1="0" y1="0" x2="0" y2="400" stroke="#333"/>
    <line x1="0" y1="400" x2="690" y2="400" stroke="#333"/>

    <!-- For each data row, compute: -->
    <!-- barWidth = 690 / numItems * 0.8 -->
    <!-- barStep = 690 / numItems -->
    <!-- x = index * barStep + (barStep - barWidth) / 2 -->
    <!-- barHeight = (value / maxValue) * 400 -->
    <!-- y = 400 - barHeight -->
    <rect x="X" y="Y" width="W" height="H" fill="COLOR"/>
    <text x="CENTER_X" y="418" text-anchor="middle" font-size="11">LABEL</text>

    <!-- Y axis label -->
    <text transform="rotate(-90)" x="-200" y="-50" text-anchor="middle" font-size="12">Revenue ($)</text>
  </g>
</svg>
</body>
</html>
```

Colors for bars: use `#1f77b4`, `#ff7f0e`, `#2ca02c`, `#d62728`, `#9467bd`, `#8c564b`, `#e377c2`, `#7f7f7f`, `#bcbd22`, `#17becf` (D3 category10).

## Line Chart Template

Read CSV time series, compute path coordinates, write this structure:

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Chart</title>
<style>body { font-family: sans-serif; margin: 20px; }</style>
</head>
<body>
<script src="d3.min.js"></script>
<svg width="800" height="400">
  <text x="400" y="20" text-anchor="middle" font-size="16" font-weight="bold">TITLE HERE</text>
  <g transform="translate(60,40)">
    <line x1="0" y1="0" x2="0" y2="320" stroke="#333"/>
    <line x1="0" y1="320" x2="700" y2="320" stroke="#333"/>

    <!-- Compute path d attribute: -->
    <!-- For each point: x = (index / (numPoints-1)) * 700 -->
    <!-- y = 320 - ((value - minValue) / (maxValue - minValue)) * 320 -->
    <!-- First point: M x,y   Subsequent: L x,y -->
    <path d="M 0,150 L 8,130 L 16,115..." fill="none" stroke="steelblue" stroke-width="2"/>

    <!-- ~6 evenly spaced date labels on x-axis -->
    <text x="0" y="340" text-anchor="middle" font-size="11">2026-01-01</text>
    <text x="140" y="340" text-anchor="middle" font-size="11">2026-01-16</text>
  </g>
</svg>
</body>
</html>
```

## Key Rules

- Fixed SVG dimensions — no viewport-relative sizing
- D3 vendored locally via curl — zero CDN references in HTML
- Single `.html` file output named `chart.html`
- ALL SVG elements must be literal tags in the HTML source
- Include product/category names as `<text>` labels
- Include axis labels and chart title as `<text>` elements
