---
name: d3-visualization
description: Build data visualizations as standalone HTML files with static inline SVG. Use when creating bar charts, line charts, scatter plots. Generate SVG server-side with a Bun script — never use CDN.
---

# D3.js Visualization — Static SVG Generation

Build charts as self-contained HTML files with **static inline SVG elements**. The approach: write a Bun/Node generation script that reads data, computes positions, and writes a complete HTML file with all `<svg>`, `<rect>`, `<path>`, and `<text>` elements as literal markup.

## CRITICAL: Generation Script Approach

**DO NOT** create HTML files that use JavaScript to dynamically create SVG elements at runtime (e.g., `d3.select("body").append("svg")`). Instead:

1. Write a **generation script** (e.g., `generate.ts`) that reads the CSV data, computes all positions/sizes, and writes a static HTML file
2. Run the script with `bun run generate.ts`
3. The output HTML contains literal `<svg>`, `<rect>`, `<path>`, `<text>` tags — no JavaScript needed

This ensures the HTML file works offline with zero dependencies and contains all chart elements as visible markup.

## Bar Chart — Complete Generation Script

Given a CSV file `sales.csv` with columns `product,revenue`:

```typescript
// generate.ts
import { readFileSync, writeFileSync } from "fs";

// 1. Read and parse CSV
const csv = readFileSync("sales.csv", "utf-8").trim().split("\n");
const headers = csv[0].split(",");
const data = csv.slice(1).map(line => {
  const [product, revenue] = line.split(",");
  return { product, revenue: Number(revenue) };
});

// 2. Chart dimensions
const width = 800, height = 500;
const margin = { top: 40, right: 30, bottom: 60, left: 80 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// 3. Compute scales
const maxRevenue = Math.max(...data.map(d => d.revenue));
// Round up to nice number
const yMax = Math.ceil(maxRevenue / 10000) * 10000;
const bandWidth = innerWidth / data.length;
const padding = 0.2;
const barWidth = bandWidth * (1 - padding);
const barOffset = bandWidth * padding / 2;

// 4. Colors
const colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];

// 5. Build SVG rects
const bars = data.map((d, i) => {
  const x = margin.left + i * bandWidth + barOffset;
  const barHeight = (d.revenue / yMax) * innerHeight;
  const y = margin.top + innerHeight - barHeight;
  return `  <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${colors[i % 10]}"/>`;
}).join("\n");

// 6. Build x-axis labels
const xLabels = data.map((d, i) => {
  const x = margin.left + i * bandWidth + bandWidth / 2;
  const y = margin.top + innerHeight + 20;
  return `  <text x="${x}" y="${y}" text-anchor="middle" font-size="11">${d.product}</text>`;
}).join("\n");

// 7. Build y-axis ticks
const tickCount = 6;
const yTicks = Array.from({length: tickCount + 1}, (_, i) => {
  const value = (yMax / tickCount) * i;
  const y = margin.top + innerHeight - (value / yMax) * innerHeight;
  return `  <text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" font-size="11">$${value.toLocaleString()}</text>
  <line x1="${margin.left}" y1="${y}" x2="${margin.left + innerWidth}" y2="${y}" stroke="#eee"/>`;
}).join("\n");

// 8. Write HTML
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Product Revenue</title>
  <style>body { font-family: sans-serif; }</style>
</head>
<body>
<svg width="${width}" height="${height}">
  <!-- Title -->
  <text x="${width / 2}" y="${margin.top / 2 + 5}" text-anchor="middle" font-size="16" font-weight="bold">Product Revenue</text>
  <!-- Y axis label -->
  <text x="15" y="${margin.top + innerHeight / 2}" text-anchor="middle" font-size="12" transform="rotate(-90, 15, ${margin.top + innerHeight / 2})">Revenue ($)</text>
  <!-- Y axis ticks -->
${yTicks}
  <!-- Bars -->
${bars}
  <!-- X axis labels -->
${xLabels}
  <!-- Axes lines -->
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + innerHeight}" stroke="#333"/>
  <line x1="${margin.left}" y1="${margin.top + innerHeight}" x2="${margin.left + innerWidth}" y2="${margin.top + innerHeight}" stroke="#333"/>
</svg>
</body>
</html>`;

writeFileSync("chart.html", html);
console.log("chart.html generated");
```

Run: `bun run generate.ts`

## Line Chart — Complete Generation Script

Given a CSV file `timeseries.csv` with columns `date,value`:

```typescript
// generate.ts
import { readFileSync, writeFileSync } from "fs";

// 1. Read and parse CSV
const csv = readFileSync("timeseries.csv", "utf-8").trim().split("\n");
const data = csv.slice(1).map(line => {
  const [date, value] = line.split(",");
  return { date, value: Number(value) };
});

// 2. Chart dimensions
const width = 800, height = 400;
const margin = { top: 40, right: 30, bottom: 60, left: 60 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// 3. Compute scales
const values = data.map(d => d.value);
const yMin = Math.floor(Math.min(...values) / 10) * 10;
const yMax = Math.ceil(Math.max(...values) / 10) * 10;
const n = data.length;

// 4. Convert data to x,y coordinates
const points = data.map((d, i) => {
  const x = margin.left + (i / (n - 1)) * innerWidth;
  const y = margin.top + innerHeight - ((d.value - yMin) / (yMax - yMin)) * innerHeight;
  return { x, y, date: d.date, value: d.value };
});

// 5. Build smooth path using monotone interpolation or simple polyline
const pathD = "M " + points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");

// 6. X-axis date labels (show ~6 evenly spaced)
const labelCount = 6;
const xLabels = Array.from({length: labelCount}, (_, i) => {
  const idx = Math.round(i * (n - 1) / (labelCount - 1));
  const p = points[idx];
  return `  <text x="${p.x}" y="${margin.top + innerHeight + 25}" text-anchor="middle" font-size="11">${data[idx].date}</text>`;
}).join("\n");

// 7. Y-axis ticks
const yTickCount = 6;
const yTicks = Array.from({length: yTickCount + 1}, (_, i) => {
  const value = yMin + (yMax - yMin) * i / yTickCount;
  const y = margin.top + innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;
  return `  <text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" font-size="11">${Math.round(value)}</text>
  <line x1="${margin.left}" y1="${y}" x2="${margin.left + innerWidth}" y2="${y}" stroke="#eee"/>`;
}).join("\n");

// 8. Write HTML
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Trend</title>
  <style>body { font-family: sans-serif; }</style>
</head>
<body>
<svg width="${width}" height="${height}">
  <!-- Title -->
  <text x="${width / 2}" y="${margin.top / 2 + 5}" text-anchor="middle" font-size="16" font-weight="bold">Daily Trend</text>
  <!-- Y axis ticks -->
${yTicks}
  <!-- Line -->
  <path d="${pathD}" fill="none" stroke="steelblue" stroke-width="2"/>
  <!-- X axis labels -->
${xLabels}
  <!-- Axes lines -->
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + innerHeight}" stroke="#333"/>
  <line x1="${margin.left}" y1="${margin.top + innerHeight}" x2="${margin.left + innerWidth}" y2="${margin.top + innerHeight}" stroke="#333"/>
</svg>
</body>
</html>`;

writeFileSync("chart.html", html);
console.log("chart.html generated");
```

Run: `bun run generate.ts`

## Key Rules

1. **Always generate static SVG** — the HTML file must contain literal `<svg>`, `<rect>`, `<path>`, and `<text>` tags
2. **Never use CDN links** — no `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, or `unpkg.com`
3. **Use a generation script** — write a `.ts` file that reads data, computes chart geometry, and writes `chart.html`
4. **Inline the data** — read the CSV in the script and embed values directly in SVG attributes
5. **Include all product/data names** in the SVG as `<text>` elements
6. **Include axis labels** like "Revenue ($)" as `<text>` elements
7. **Include chart title** as a `<text>` element
8. **No `<script>` tags needed** in the final HTML — the chart is pure SVG markup
