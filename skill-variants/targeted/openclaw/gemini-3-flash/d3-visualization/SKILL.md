---
name: d3-visualization
description: Build data visualizations as standalone HTML files with static SVG markup. Compute all positions yourself and write SVG elements directly in HTML. Never use CDN. Never use JavaScript to create SVG.
---

# Static SVG Chart Generation

## MANDATORY: Write to File

You MUST use the file write tool to create `chart.html`. Do NOT output HTML as a code block in your response — use the write tool to save it directly to `chart.html`.

## MANDATORY: No JavaScript SVG Creation

**DO NOT use JavaScript to create or append SVG elements.** Every `<svg>`, `<rect>`, `<path>`, `<text>`, `<line>`, and `<g>` element MUST appear as a literal HTML tag in the file you write. The HTML file should contain ZERO JavaScript. Do NOT use D3.js, do NOT use `document.createElement`, do NOT use `.append()`.

**Instead:** Read the data, compute all positions/sizes/coordinates yourself, and write pure static HTML+SVG.

## No CDN

Never include CDN URLs (jsdelivr, cdnjs, unpkg) in the HTML file.

## Bar Chart — How to Build

1. Read the CSV to get category names and values
2. Set dimensions: width, height, margins
3. Compute innerWidth = width - marginLeft - marginRight, innerHeight = height - marginTop - marginBottom
4. Find maxValue from data
5. For N categories: step = innerWidth / N, barWidth = step * 0.8
6. For each bar i:
   - x = marginLeft + i * step + step * 0.1
   - barHeight = (value / maxValue) * innerHeight
   - y = marginTop + innerHeight - barHeight
7. Write the HTML file with ALL elements as static SVG tags

### Bar Chart Example (complete file)

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Product Revenue</title>
<style>body{font-family:sans-serif;margin:20px}</style>
</head>
<body>
<svg width="800" height="500">
  <text x="400" y="25" text-anchor="middle" font-size="16" font-weight="bold">Product Revenue</text>
  <g transform="translate(80,40)">
    <line x1="0" y1="0" x2="0" y2="400" stroke="#333"/>
    <line x1="0" y1="400" x2="690" y2="400" stroke="#333"/>
    <text transform="rotate(-90)" x="-200" y="-50" text-anchor="middle" font-size="13">Revenue ($)</text>
    <line x1="-5" y1="400" x2="0" y2="400" stroke="#333"/><text x="-8" y="404" text-anchor="end" font-size="11">$0</text>
    <line x1="-5" y1="300" x2="0" y2="300" stroke="#333"/><text x="-8" y="304" text-anchor="end" font-size="11">$13,000</text>
    <line x1="-5" y1="200" x2="0" y2="200" stroke="#333"/><text x="-8" y="204" text-anchor="end" font-size="11">$26,000</text>
    <line x1="-5" y1="100" x2="0" y2="100" stroke="#333"/><text x="-8" y="104" text-anchor="end" font-size="11">$39,000</text>
    <line x1="-5" y1="0" x2="0" y2="0" stroke="#333"/><text x="-8" y="4" text-anchor="end" font-size="11">$52,000</text>
    <rect x="8" y="54" width="69" height="346" fill="#1f77b4"/>
    <text x="43" y="418" text-anchor="middle" font-size="11">Widgets</text>
    <rect x="94" y="108" width="69" height="292" fill="#ff7f0e"/>
    <text x="129" y="418" text-anchor="middle" font-size="11">Gadgets</text>
  </g>
</svg>
</body>
</html>
```

**Key:** Every visual element is a literal HTML tag — no `<script>` tags at all.

### Bar Colors

Cycle through: `#1f77b4`, `#ff7f0e`, `#2ca02c`, `#d62728`, `#9467bd`, `#8c564b`, `#e377c2`, `#7f7f7f`, `#bcbd22`, `#17becf`

## Line Chart — How to Build

1. Read the CSV to get dates and values
2. Set dimensions (e.g. width=800, height=400, margins)
3. Compute innerWidth, innerHeight
4. Find minValue and maxValue from data
5. For N data points, compute each point:
   - x = (i / (N-1)) * innerWidth
   - y = innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight
6. Build path d attribute: "M x0,y0 L x1,y1 L x2,y2 ..."
7. Pick ~6 evenly spaced dates for x-axis tick labels — **MUST include the full year** (e.g. "2026-01-01" or "Jan 1, 2026")
8. Write the HTML file with ALL elements as static SVG tags

### Line Chart Example (complete file)

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Daily Trend</title>
<style>body{font-family:sans-serif;margin:20px}</style>
</head>
<body>
<svg width="800" height="400">
  <text x="400" y="25" text-anchor="middle" font-size="16" font-weight="bold">Daily Trend</text>
  <g transform="translate(80,40)">
    <line x1="0" y1="0" x2="0" y2="300" stroke="#333"/>
    <line x1="0" y1="300" x2="690" y2="300" stroke="#333"/>
    <line x1="-5" y1="300" x2="0" y2="300" stroke="#333"/><text x="-8" y="304" text-anchor="end" font-size="11">90</text>
    <line x1="-5" y1="150" x2="0" y2="150" stroke="#333"/><text x="-8" y="154" text-anchor="end" font-size="11">120</text>
    <line x1="-5" y1="0" x2="0" y2="0" stroke="#333"/><text x="-8" y="4" text-anchor="end" font-size="11">150</text>
    <text x="0" y="320" text-anchor="middle" font-size="10">2026-01-01</text>
    <text x="138" y="320" text-anchor="middle" font-size="10">2026-01-19</text>
    <text x="276" y="320" text-anchor="middle" font-size="10">2026-02-06</text>
    <text x="414" y="320" text-anchor="middle" font-size="10">2026-02-24</text>
    <text x="552" y="320" text-anchor="middle" font-size="10">2026-03-13</text>
    <text x="690" y="320" text-anchor="middle" font-size="10">2026-03-31</text>
    <path d="M0,250 L7.7,233 L15.5,220 L23.2,208 ..." fill="none" stroke="steelblue" stroke-width="2"/>
  </g>
</svg>
</body>
</html>
```

**Key:** The `<path>` element is written directly in the HTML with a pre-computed `d` attribute. Date tick labels include the year "2026". No JavaScript anywhere.

## Final Checklist

Before writing chart.html, verify these are ALL true:
- The file contains ZERO `<script>` tags
- `<svg` appears as a literal HTML tag
- For bar charts: one `<rect` per data row appears as literal HTML tags
- For line charts: `<path` appears as a literal HTML tag with computed `d` attribute
- No CDN URLs (jsdelivr, cdnjs, unpkg)
- Chart title appears as a `<text>` element
- Axis labels appear as `<text>` elements
- For date axes: the year (e.g. "2026") appears in x-axis tick labels
- All product/category names from the CSV appear as `<text>` elements
