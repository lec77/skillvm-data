---
name: d3-visualization
description: Build data visualizations with D3.js as standalone HTML files. Use when creating bar charts, line charts, scatter plots, or any SVG-based data visualization. Always vendor D3 locally, never use CDN.
---

# D3.js Visualization

Build self-contained HTML chart files with **static, pre-rendered SVG**. The output HTML must contain literal SVG markup — no JavaScript that dynamically creates elements.

## Two-Step Process

**ALWAYS use this two-step process:**

### Step 1: Write a Generator Script

Write a Node.js/Bun script (`generate-chart.js`) that:
- Reads input data (CSV/JSON)
- Computes all positions, scales, and layout using simple math
- Generates a complete HTML string with **fully expanded static SVG** — every `<rect>`, `<path>`, `<text>`, `<line>` element written out with hardcoded numeric coordinates
- Writes the result to `chart.html`

### Step 2: Run the Script

```bash
node generate-chart.js
```

This produces a chart.html with **zero JavaScript** — pure static SVG.

## Setup: Vendor D3 Locally

Download D3 for the final HTML file (referenced but NOT used in the generator):

```bash
curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js
```

The chart.html references it with `<script src="d3.min.js"></script>` for compatibility, but the SVG is already fully rendered.

## Generator Script Template (Bar Chart)

```javascript
// generate-chart.js
const fs = require("fs");

// Read and parse CSV
const csv = fs.readFileSync("sales.csv", "utf-8");
const rows = csv.trim().split("\n").slice(1); // skip header
const data = rows.map(r => {
  const [name, val] = r.split(",");
  return { name: name.trim(), value: Number(val) };
});

// Layout
const width = 800, height = 500;
const margin = { top: 40, right: 30, bottom: 60, left: 80 };
const innerW = width - margin.left - margin.right;
const innerH = height - margin.top - margin.bottom;

// Scale calculations (no D3 needed)
const maxVal = Math.max(...data.map(d => d.value));
// Round up to nice number
const niceMax = Math.ceil(maxVal / 10000) * 10000;
const padding = 0.2;
const step = innerW / data.length;
const barW = step * (1 - padding);
const barOffset = step * padding / 2;

function yPos(v) { return innerH - (v / niceMax) * innerH; }
function xPos(i) { return i * step + barOffset; }

// Colors
const colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];

// Build each <rect> element individually
let rects = "";
for (let i = 0; i < data.length; i++) {
  const d = data[i];
  const x = xPos(i);
  const y = yPos(d.value);
  const h = innerH - y;
  rects += `    <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${colors[i % 10]}"></rect>\n`;
}

// Build axis ticks
let yTicks = "";
const tickCount = 6;
for (let i = 0; i <= tickCount; i++) {
  const val = (niceMax / tickCount) * i;
  const y = yPos(val);
  yTicks += `    <g transform="translate(0,${y.toFixed(1)})"><line x2="-6" stroke="#333"></line><text x="-9" dy="0.32em" text-anchor="end" font-size="11">$${val.toLocaleString()}</text></g>\n`;
}

let xTicks = "";
for (let i = 0; i < data.length; i++) {
  const x = xPos(i) + barW / 2;
  xTicks += `    <g transform="translate(${x.toFixed(1)},0)"><line y2="6" stroke="#333"></line><text y="20" text-anchor="middle" font-size="11">${data[i].name}</text></g>\n`;
}

// Assemble HTML with static SVG
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Product Revenue</title>
  <style>body { font-family: sans-serif; margin: 20px; }</style>
</head>
<body>
<script src="d3.min.js"></script>
<svg width="${width}" height="${height}">
  <text x="${width/2}" y="${margin.top/2 + 5}" text-anchor="middle" font-size="16" font-weight="bold">Product Revenue</text>
  <g transform="translate(${margin.left},${margin.top})">
    <g transform="translate(0,${innerH})">
      <line x2="${innerW}" stroke="#333"></line>
${xTicks}    </g>
    <g>
      <line y2="${innerH}" stroke="#333"></line>
${yTicks}    </g>
    <text transform="rotate(-90)" y="-60" x="${-innerH/2}" text-anchor="middle" font-size="13">Revenue ($)</text>
${rects}  </g>
</svg>
</body>
</html>`;

fs.writeFileSync("chart.html", html);
console.log("Generated chart.html");
```

## Generator Script Template (Line Chart)

```javascript
// generate-chart.js
const fs = require("fs");

// Read and parse CSV
const csv = fs.readFileSync("timeseries.csv", "utf-8");
const rows = csv.trim().split("\n").slice(1);
const data = rows.map(r => {
  const [date, val] = r.split(",");
  return { date: date.trim(), value: Number(val) };
});

// Layout
const width = 800, height = 400;
const margin = { top: 40, right: 30, bottom: 60, left: 60 };
const innerW = width - margin.left - margin.right;
const innerH = height - margin.top - margin.bottom;

// Scale calculations
const maxVal = Math.max(...data.map(d => d.value));
const niceMax = Math.ceil(maxVal / 10) * 10;
const minVal = Math.min(...data.map(d => d.value));

function yPos(v) { return innerH - ((v - 0) / (niceMax - 0)) * innerH; }
function xPos(i) { return (i / (data.length - 1)) * innerW; }

// Build <path> d attribute with all points
let pathD = `M${xPos(0).toFixed(1)},${yPos(data[0].value).toFixed(1)}`;
for (let i = 1; i < data.length; i++) {
  pathD += ` L${xPos(i).toFixed(1)},${yPos(data[i].value).toFixed(1)}`;
}

// Build x-axis ticks (~6 ticks spread across data)
const tickInterval = Math.floor(data.length / 5);
let xTicks = "";
for (let i = 0; i < data.length; i += tickInterval) {
  const x = xPos(i);
  xTicks += `    <g transform="translate(${x.toFixed(1)},0)"><line y2="6" stroke="#333"></line><text y="20" text-anchor="middle" font-size="11">${data[i].date}</text></g>\n`;
}
// Always include last tick
const lastX = xPos(data.length - 1);
xTicks += `    <g transform="translate(${lastX.toFixed(1)},0)"><line y2="6" stroke="#333"></line><text y="20" text-anchor="middle" font-size="11">${data[data.length-1].date}</text></g>\n`;

// Build y-axis ticks
let yTicks = "";
const yTickCount = 6;
for (let i = 0; i <= yTickCount; i++) {
  const val = Math.round((niceMax / yTickCount) * i);
  const y = yPos(val);
  yTicks += `    <g transform="translate(0,${y.toFixed(1)})"><line x2="-6" stroke="#333"></line><text x="-9" dy="0.32em" text-anchor="end" font-size="11">${val}</text></g>\n`;
}

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Trend</title>
  <style>body { font-family: sans-serif; margin: 20px; }</style>
</head>
<body>
<script src="d3.min.js"></script>
<svg width="${width}" height="${height}">
  <text x="${width/2}" y="${margin.top/2 + 5}" text-anchor="middle" font-size="16" font-weight="bold">Daily Trend</text>
  <g transform="translate(${margin.left},${margin.top})">
    <g transform="translate(0,${innerH})">
      <line x2="${innerW}" stroke="#333"></line>
${xTicks}    </g>
    <g>
      <line y2="${innerH}" stroke="#333"></line>
${yTicks}    </g>
    <path d="${pathD}" fill="none" stroke="steelblue" stroke-width="2"></path>
  </g>
</svg>
</body>
</html>`;

fs.writeFileSync("chart.html", html);
console.log("Generated chart.html");
```

## Key Rules

1. **Never use CDN** — download d3.min.js locally with `curl`
2. **Always use two-step generation**: write a script, run it, produce static HTML
3. **chart.html must contain literal SVG markup** — every `<svg>`, `<rect>`, `<path>`, `<text>` element written out with numeric values, not generated by JavaScript at runtime
4. **chart.html should have zero or minimal JavaScript** — the SVG is pre-rendered
5. **Inline all data** — read CSV in the generator script, embed computed values in the output HTML
6. **Fixed SVG dimensions** — use explicit width/height attributes
7. **Include the `<script src="d3.min.js"></script>` tag** in the output HTML for compatibility
