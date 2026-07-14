---
name: d3-visualization
description: Build data visualizations with D3.js as standalone HTML files. Use when creating bar charts, line charts, scatter plots, or any SVG-based data visualization. Always vendor D3 locally, never use CDN.
---

# D3.js Visualization

Build SVG-based charts as self-contained HTML files using D3.js v7. All files must work offline — never use CDN links.

## CRITICAL: Static SVG Output

Tests validate the raw HTML source file, NOT a rendered browser page. Every SVG element (`<svg>`, `<rect>`, `<path>`, `<text>`, `<line>`, `<g>`) MUST appear as literal HTML tags in the file.

**WRONG** — D3 creates elements at runtime (invisible in source):
```javascript
d3.select("body").append("svg")  // <svg> not in HTML source!
g.selectAll(".bar").data(data).join("rect")  // <rect> not in HTML source!
```

**RIGHT** — Write SVG elements directly in the HTML body:
```html
<svg width="800" height="500">
  <g transform="translate(80,40)">
    <rect x="10" y="50" width="80" height="300" fill="#1f77b4"/>
    <rect x="110" y="100" width="80" height="250" fill="#ff7f0e"/>
    <path d="M0,350 L100,300 L200,250" fill="none" stroke="steelblue" stroke-width="2"/>
    <text x="400" y="20" text-anchor="middle" font-size="16px" font-weight="bold">Title</text>
  </g>
</svg>
```

## Workflow

1. Read the CSV data file
2. Download D3.js locally: `curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js`
3. Compute all positions, scales, and values from the data
4. Write chart.html with ALL SVG elements as static markup in the HTML body
5. Include `<script src="d3.min.js"></script>` for the D3 dependency (but SVG is static)

## No CDN Rule

Never use CDN URLs. Download d3.min.js to the working directory:
```bash
curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js
```
Reference as: `<script src="d3.min.js"></script>`

## Margins Convention

```
const width = 800, height = 500;
const margin = { top: 40, right: 30, bottom: 60, left: 80 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
```

Use these to compute positions, then write the SVG with a `<g transform="translate(80,40)">` wrapper.

## Bar Chart Pattern

For a bar chart with N items, compute x/y positions from the data, then write each `<rect>` element directly:

```html
<svg width="800" height="500">
  <g transform="translate(80,40)">
    <!-- Bars: one <rect> per data row -->
    <rect x="0" y="50" width="75" height="350" fill="#1f77b4"/>
    <rect x="86" y="120" width="75" height="280" fill="#ff7f0e"/>
    <!-- ... one rect per product ... -->

    <!-- X axis labels -->
    <text x="37" y="415" text-anchor="middle" font-size="11px">Product A</text>

    <!-- Y axis label -->
    <text transform="rotate(-90)" y="-60" x="-200" text-anchor="middle">Revenue ($)</text>

    <!-- X axis line -->
    <line x1="0" y1="400" x2="690" y2="400" stroke="#333"/>
  </g>

  <!-- Chart title -->
  <text x="400" y="20" text-anchor="middle" font-size="16px" font-weight="bold">Product Revenue</text>
</svg>
```

Use `d3.scaleBand()` and `d3.scaleLinear()` logic to compute positions, but write the final values as static attributes.

Colors for bars (d3.schemeCategory10): #1f77b4, #ff7f0e, #2ca02c, #d62728, #9467bd, #8c564b, #e377c2, #7f7f7f, #bcbd22, #17becf

## Line Chart Pattern

For a line chart, compute the SVG path `d` attribute from the data points, then write it as a static `<path>`:

```html
<svg width="800" height="400">
  <g transform="translate(80,40)">
    <!-- The line -->
    <path d="M0,250 L8,230 L16,215 ..." fill="none" stroke="steelblue" stroke-width="2"/>

    <!-- X axis tick labels — MUST include the year (e.g. "2026-01-01" or "Jan 2026") -->
    <text x="0" y="315" text-anchor="middle" font-size="11px">2026-01-01</text>
    <text x="115" y="315" text-anchor="middle" font-size="11px">2026-01-16</text>

    <!-- Y axis -->
    <line x1="0" y1="0" x2="0" y2="300" stroke="#333"/>
    <line x1="0" y1="300" x2="690" y2="300" stroke="#333"/>
  </g>

  <!-- Title -->
  <text x="400" y="20" text-anchor="middle" font-size="16px" font-weight="bold">Daily Trend</text>
</svg>
```

Compute x positions using linear interpolation across the date range. Compute y positions by mapping values to the innerHeight range.

**Date labels MUST include the year** (e.g. "2026-01-01" or "Jan 2026"). Never omit the year from date axis labels.

## Computing Positions

To compute bar/line positions from data:

**Band scale (bars):** `x = index * (innerWidth / count)`, `barWidth = innerWidth / count * 0.8`

**Linear scale (y-axis):** `y = innerHeight - (value / maxValue) * innerHeight`

**Time scale (x-axis for dates):** `x = (dayIndex / totalDays) * innerWidth`

## Complete Self-Contained Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Chart</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
  </style>
</head>
<body>
<script src="d3.min.js"></script>
<svg width="800" height="500">
  <g transform="translate(80,40)">
    <rect x="0" y="0" width="330" height="400" fill="#1f77b4"/>
    <rect x="360" y="200" width="330" height="200" fill="#ff7f0e"/>
    <text x="165" y="420" text-anchor="middle" font-size="11px">A</text>
    <text x="525" y="420" text-anchor="middle" font-size="11px">B</text>
    <text transform="rotate(-90)" y="-60" x="-200" text-anchor="middle">Value</text>
    <line x1="0" y1="400" x2="690" y2="400" stroke="#333"/>
    <line x1="0" y1="0" x2="0" y2="400" stroke="#333"/>
  </g>
  <text x="400" y="20" text-anchor="middle" font-size="16px" font-weight="bold">My Chart</text>
</svg>
</body>
</html>
```

Key points:
- `<svg>` tag is directly in the HTML body — NOT created by JavaScript
- All `<rect>`, `<path>`, `<text>`, `<line>` elements are static HTML tags
- Positions are pre-computed numbers, not JavaScript expressions
- `d3.min.js` is referenced locally (downloaded via curl), never from a CDN
