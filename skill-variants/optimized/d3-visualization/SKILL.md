---
name: d3-visualization
description: Build data visualizations with D3.js as standalone HTML files. Use when creating bar charts, line charts, scatter plots, or any SVG-based data visualization. Always vendor D3 locally, never use CDN.
---

# D3.js Visualization

Build self-contained HTML chart files using D3.js v7. **All files must work offline — never use CDN.**

## Setup: Vendor D3 Locally

```bash
curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js
```
Reference as `<script src="d3.min.js"></script>` in HTML.

## CRITICAL: Output Requirements

The final `chart.html` file source MUST contain these literal HTML/SVG tags:
- `<svg` — the SVG container element as an actual tag in the source
- `<rect` — for bar charts, one per data point, as actual tags
- `<path` — for line charts, as an actual tag
- `<text` — for labels and titles

**WARNING:** D3's `.append("rect")` and `.append("path")` create elements at runtime — they will NOT appear as literal tags in the HTML source file. You MUST either:

1. **Pre-compute and write static SVG** (recommended): Calculate all positions from the data, then write the complete SVG with all elements directly in the HTML.
2. **Use D3's `innerHTML` approach**: Build the chart with D3, then serialize and embed the result.

## Pre-computed Static SVG Approach

Read the data, compute scale mappings manually, write literal SVG:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Chart</title>
  <style>body { font-family: sans-serif; margin: 20px; }</style>
</head>
<body>
<script src="d3.min.js"></script>
<svg width="800" height="500">
  <text x="400" y="20" text-anchor="middle" font-size="16" font-weight="bold">Product Revenue</text>
  <g transform="translate(80,40)">
    <!-- Y axis line -->
    <line x1="0" y1="0" x2="0" y2="400" stroke="#333"/>
    <!-- X axis line -->
    <line x1="0" y1="400" x2="690" y2="400" stroke="#333"/>

    <!-- Bars: x = index * step + padding, y = innerHeight - (value/maxValue)*innerHeight -->
    <rect x="9" y="53.8" width="77" height="346.2" fill="#1f77b4"/>
    <text x="47" y="418" text-anchor="middle" font-size="11">Widgets</text>

    <rect x="95" y="107.7" width="77" height="292.3" fill="#ff7f0e"/>
    <text x="134" y="418" text-anchor="middle" font-size="11">Gadgets</text>
    <!-- ... more bars ... -->

    <!-- Y axis labels -->
    <text x="-8" y="400" text-anchor="end" font-size="11">$0</text>
    <text x="-8" y="320" text-anchor="end" font-size="11">$10,000</text>
    <!-- ... more ticks ... -->

    <!-- Y axis label -->
    <text transform="rotate(-90)" x="-200" y="-50" text-anchor="middle" font-size="12">Revenue ($)</text>
  </g>
</svg>
</body>
</html>
```

## Line Chart Static Approach

For line charts, compute SVG path data string from the time series:

```html
<svg width="800" height="400">
  <text x="400" y="20" text-anchor="middle" font-size="16" font-weight="bold">Daily Trend</text>
  <g transform="translate(60,40)">
    <!-- Path d attribute: M x0,y0 L x1,y1 L x2,y2 ... -->
    <path d="M 0,150 L 8,130 L 16,115 L 24,100..." fill="none" stroke="steelblue" stroke-width="2"/>

    <!-- X axis date ticks (~6 evenly spaced) -->
    <text x="0" y="320" text-anchor="middle" font-size="11">2026-01</text>
    <text x="140" y="320" text-anchor="middle" font-size="11">2026-02</text>
    <!-- ... -->
  </g>
</svg>
```

The path `d` attribute uses: `M x,y` (move to first point) then `L x,y` for each subsequent point.
- x = (dateIndex / totalDays) * innerWidth
- y = innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight

## D3 Dynamic Approach (Alternative)

If using D3 to build the chart dynamically, you MUST include a literal `<svg>` tag in the HTML:
```html
<svg id="chart" width="800" height="500"></svg>
<script src="d3.min.js"></script>
<script>
const svg = d3.select("#chart");
// Use D3 to append elements dynamically
</script>
```

**Note:** With this approach, elements like `<rect>` and `<path>` are created at runtime and will NOT be in the HTML source. The static approach above is preferred.

## Data Loading

```javascript
const data = d3.csvParse(`cat,val\nA,100`, d3.autoType);
// Or from file:
fetch("data.csv").then(r => r.text()).then(text => {
  const data = d3.csvParse(text, d3.autoType);
});
```

## Key Rules

- Fixed SVG dimensions (e.g. 800×500) — no viewport-relative sizing
- Explicit tick count (~6) — don't rely on auto-tick
- D3 vendored locally — zero network requests
- Single `.html` file with embedded styles
- **HTML source MUST contain literal `<svg>`, `<rect>`, `<path>`, `<text>` tags**
