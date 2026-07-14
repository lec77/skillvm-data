---
name: d3-visualization
description: Build data visualizations with D3.js as standalone HTML files with static SVG. Use a build script to generate chart.html with literal SVG elements. Always vendor D3 locally, never use CDN.
---

# D3.js Visualization — Build Script Approach

Create charts as **static HTML files with pre-rendered SVG** using a Node.js/Bun build script. The build script reads data, computes layout, and writes chart.html with literal `<svg>`, `<rect>`, `<path>` elements in the HTML source. No client-side JavaScript needed in the final output.

## CRITICAL RULES

1. **ALWAYS read the input data file first** — never use placeholder data
2. **Use a build script** — write a generate.js script that creates chart.html with static SVG
3. **Download d3.min.js locally** before starting: `curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js`
4. **No CDN links** in the final chart.html — reference d3.min.js locally or omit it
5. The final chart.html must contain **literal SVG tags** (`<svg`, `<rect`, `<path`) in the HTML source

## Step-by-Step Process

### Step 1: Read the input data file
```
read_file: data.csv (or whatever the input file is)
```

### Step 2: Download D3.js locally
```bash
curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js
```

### Step 3: Write a build script (generate.js)

The script reads the CSV, computes positions, and writes a static HTML file.

### Step 4: Run the build script
```bash
node generate.js
```

## Bar Chart Build Script Template

Given a CSV with columns like `product,revenue`:

```javascript
const fs = require('fs');

// Read CSV data
const csv = fs.readFileSync('sales.csv', 'utf-8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',');
const data = lines.slice(1).map(line => {
  const parts = line.split(',');
  return { name: parts[0], value: Number(parts[1]) };
});

// Chart dimensions
const width = 800, height = 500;
const margin = { top: 40, right: 30, bottom: 60, left: 80 };
const innerW = width - margin.left - margin.right;
const innerH = height - margin.top - margin.bottom;

// Compute scales
const maxVal = Math.max(...data.map(d => d.value));
const barW = innerW / data.length * 0.8;
const gap = innerW / data.length * 0.2;
const colors = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'];

// Build bar rects
let rects = '';
data.forEach((d, i) => {
  const x = margin.left + i * (innerW / data.length) + gap / 2;
  const barH = (d.value / maxVal) * innerH;
  const y = margin.top + (innerH - barH);
  rects += `  <rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="${colors[i % 10]}" />\n`;
});

// Build x-axis labels
let labels = '';
data.forEach((d, i) => {
  const x = margin.left + i * (innerW / data.length) + (innerW / data.length) / 2;
  const y = margin.top + innerH + 20;
  labels += `  <text x="${x}" y="${y}" text-anchor="middle" font-size="11">${d.name}</text>\n`;
});

// Build y-axis ticks
let yTicks = '';
const tickCount = 6;
for (let i = 0; i <= tickCount; i++) {
  const val = Math.round(maxVal * i / tickCount);
  const y = margin.top + innerH - (i / tickCount) * innerH;
  yTicks += `  <text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" font-size="11">$${val.toLocaleString()}</text>\n`;
  yTicks += `  <line x1="${margin.left}" y1="${y}" x2="${margin.left + innerW}" y2="${y}" stroke="#eee" />\n`;
}

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bar Chart</title>
  <style>body { font-family: sans-serif; margin: 20px; }</style>
</head>
<body>
<svg width="${width}" height="${height}">
  <!-- Title -->
  <text x="${width / 2}" y="${margin.top / 2 + 5}" text-anchor="middle" font-size="16" font-weight="bold">Product Revenue</text>

  <!-- Y-axis label -->
  <text transform="rotate(-90)" x="${-(margin.top + innerH / 2)}" y="15" text-anchor="middle" font-size="12">Revenue ($)</text>

  <!-- Y-axis ticks -->
${yTicks}
  <!-- Bars -->
${rects}
  <!-- X-axis labels -->
${labels}
  <!-- Axes lines -->
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + innerH}" stroke="#333" />
  <line x1="${margin.left}" y1="${margin.top + innerH}" x2="${margin.left + innerW}" y2="${margin.top + innerH}" stroke="#333" />
</svg>
<script src="d3.min.js"></script>
</body>
</html>`;

fs.writeFileSync('chart.html', html);
console.log('chart.html created');
```

## Line Chart Build Script Template

Given a CSV with columns like `date,value`. IMPORTANT: keep date as a raw string (do NOT convert to Date object or use toLocaleDateString). The raw string preserves the year (e.g. "2026-01-01").

```javascript
const fs = require('fs');

// Read CSV data — keep date as string to preserve the year
const csv = fs.readFileSync('timeseries.csv', 'utf-8');
const lines = csv.trim().split('\n');
const data = lines.slice(1).map(line => {
  const [date, value] = line.split(',');
  return { date, value: Number(value) };  // date stays as string like "2026-01-01"
});

// Chart dimensions
const width = 800, height = 400;
const margin = { top: 40, right: 30, bottom: 60, left: 80 };
const innerW = width - margin.left - margin.right;
const innerH = height - margin.top - margin.bottom;

// Compute scales
const minVal = Math.min(...data.map(d => d.value));
const maxVal = Math.max(...data.map(d => d.value));
const yMin = 0;
const yMax = maxVal;

// Build SVG path for the line
let pathD = '';
data.forEach((d, i) => {
  const x = margin.left + (i / (data.length - 1)) * innerW;
  const y = margin.top + innerH - ((d.value - yMin) / (yMax - yMin)) * innerH;
  pathD += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
});

// Build x-axis date labels (show ~6 ticks) — use raw date strings to preserve year
let dateLabels = '';
const tickStep = Math.floor(data.length / 6);
for (let i = 0; i < data.length; i += tickStep) {
  const x = margin.left + (i / (data.length - 1)) * innerW;
  const y = margin.top + innerH + 20;
  // IMPORTANT: use data[i].date directly (e.g. "2026-01-01") to keep the year in the output
  dateLabels += `  <text x="${x}" y="${y}" text-anchor="middle" font-size="11">${data[i].date}</text>\n`;
}

// Build y-axis ticks
let yTicks = '';
const tickCount = 6;
for (let i = 0; i <= tickCount; i++) {
  const val = Math.round(yMin + (yMax - yMin) * i / tickCount);
  const y = margin.top + innerH - (i / tickCount) * innerH;
  yTicks += `  <text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" font-size="11">${val}</text>\n`;
  yTicks += `  <line x1="${margin.left}" y1="${y}" x2="${margin.left + innerW}" y2="${y}" stroke="#eee" />\n`;
}

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Trend</title>
  <style>body { font-family: sans-serif; margin: 20px; }</style>
</head>
<body>
<svg width="${width}" height="${height}">
  <!-- Title -->
  <text x="${width / 2}" y="${margin.top / 2 + 5}" text-anchor="middle" font-size="16" font-weight="bold">Daily Trend</text>

  <!-- Y-axis ticks -->
${yTicks}
  <!-- Line -->
  <path d="${pathD}" fill="none" stroke="steelblue" stroke-width="2" />

  <!-- X-axis date labels -->
${dateLabels}
  <!-- Axes lines -->
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + innerH}" stroke="#333" />
  <line x1="${margin.left}" y1="${margin.top + innerH}" x2="${margin.left + innerW}" y2="${margin.top + innerH}" stroke="#333" />
</svg>
<script src="d3.min.js"></script>
</body>
</html>`;

fs.writeFileSync('chart.html', html);
console.log('chart.html created');
```

## Key Reminders

- **ALWAYS read the CSV file first** — use the actual data, never invent placeholder values
- **Do NOT use `require('d3')` or import d3** in the build script — D3 is a browser library, not available in Node.js. Compute all positions with plain JavaScript math.
- The build script outputs chart.html with **literal SVG elements** in the HTML source
- Every `<rect>` bar must appear as a literal tag in the HTML
- Every `<path>` line must appear as a literal tag in the HTML
- Include `<script src="d3.min.js"></script>` in the HTML for D3 reference
- Product names from the CSV must appear verbatim in the HTML
- **Date labels must include the year** — use the raw date string from the CSV (e.g. "2026-01-01"), do NOT use `toLocaleDateString()` which drops the year
