---
name: d3-visualization
description: Build data visualizations with D3.js as standalone HTML files. Use when creating bar charts, line charts, scatter plots, or any SVG-based data visualization. Always vendor D3 locally, never use CDN.
---

# D3.js Visualization

Build interactive and static SVG-based charts as self-contained HTML files using D3.js v7. All files must work offline — never use CDN links.

## When to Use

- Creating bar charts, line charts, scatter plots, or area charts from data
- Generating standalone HTML visualizations that open in any browser
- Building charts from CSV, JSON, or inline data
- Any SVG-based data visualization task

## Setup: Vendor D3 Locally

Never use CDN. Download D3 once and embed or reference it locally.

```bash
# Download d3.min.js to working directory
curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js
```

Then reference it as a local file in the HTML:
```html
<script src="d3.min.js"></script>
```

Or inline the entire library into the HTML `<script>` tag for a truly self-contained file:
```html
<script>
/* d3.min.js contents pasted here */
</script>
```

## Standalone HTML Template

Every chart is a single `.html` file with embedded styles and scripts:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Chart Title</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    .axis text { font-size: 12px; }
    .axis path, .axis line { fill: none; stroke: #333; shape-rendering: crispEdges; }
    .title { font-size: 16px; font-weight: bold; }
  </style>
</head>
<body>
  <script src="d3.min.js"></script>
  <script>
    // Chart code here
  </script>
</body>
</html>
```

## Margins Convention

Always use the standard margin object. Inner dimensions are derived from outer:

```javascript
const width = 800, height = 500;
const margin = { top: 40, right: 30, bottom: 60, left: 80 };
const innerWidth  = width  - margin.left - margin.right;
const innerHeight = height - margin.top  - margin.bottom;

const svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);
```

## Scales

### Linear Scale (continuous numeric)
```javascript
const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .range([innerHeight, 0])
  .nice();
```

### Band Scale (categorical — bar chart x-axis)
```javascript
const xScale = d3.scaleBand()
  .domain(data.map(d => d.category))
  .range([0, innerWidth])
  .padding(0.2);
```

### Time Scale (date x-axis)
```javascript
const xScale = d3.scaleTime()
  .domain(d3.extent(data, d => d.date))
  .range([0, innerWidth]);
```

## Axes

```javascript
// X axis (bottom)
g.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0,${innerHeight})`)
  .call(d3.axisBottom(xScale).ticks(6))
  .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

// Y axis (left)
g.append("g")
  .attr("class", "axis")
  .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => `$${d3.format(",d")(d)}`));

// Axis label
g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left + 15)
  .attr("x", -innerHeight / 2)
  .attr("text-anchor", "middle")
  .text("Revenue ($)");
```

## Bar Chart

```javascript
// Bars
g.selectAll(".bar")
  .data(data)
  .join("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.category))
    .attr("y", d => yScale(d.value))
    .attr("width", xScale.bandwidth())
    .attr("height", d => innerHeight - yScale(d.value))
    .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);
```

## Line Chart

```javascript
// Parse dates — must happen before building scales
const parseDate = d3.timeParse("%Y-%m-%d");
data.forEach(d => { d.date = parseDate(d.date); d.value = +d.value; });

// Line generator
const line = d3.line()
  .x(d => xScale(d.date))
  .y(d => yScale(d.value))
  .curve(d3.curveMonotoneX);

// Draw path
g.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2)
  .attr("d", line);
```

## Data Loading

### Inline CSV string (no server needed)
```javascript
const csvData = `category,value
A,100
B,200`;
const data = d3.csvParse(csvData, d3.autoType);
```

### Fetch from file (requires local server or same-origin)
```javascript
const data = await d3.csv("data.csv", d3.autoType);
```

### Inline JSON array
```javascript
const data = [
  { category: "A", value: 100 },
  { category: "B", value: 200 },
];
```

## Chart Title

```javascript
svg.append("text")
  .attr("class", "title")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .text("Chart Title");
```

## Colors

```javascript
// Categorical (10 distinct colors)
const color = d3.schemeCategory10;
fill: (d, i) => color[i % 10]

// Sequential (blue gradient)
const colorScale = d3.scaleSequential(d3.interpolateBlues)
  .domain([0, d3.max(data, d => d.value)]);
fill: d => colorScale(d.value)
```

## Tooltips

```javascript
const tooltip = d3.select("body").append("div")
  .style("position", "absolute")
  .style("background", "rgba(0,0,0,0.7)")
  .style("color", "#fff")
  .style("padding", "6px 10px")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("display", "none");

// Attach to elements
g.selectAll(".bar")
  // ... (join/attrs as above)
  .on("mouseover", (event, d) => {
    tooltip.style("display", "block")
      .html(`<strong>${d.category}</strong>: ${d.value}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top",  (event.pageY - 28) + "px");
  })
  .on("mouseout", () => tooltip.style("display", "none"));
```

## Deterministic Output Checklist

- Fixed SVG dimensions (e.g., `800×500`) — no viewport-relative sizing
- No CSS animations or transitions
- Explicit tick count (`.ticks(6)`) — do not rely on D3's auto-tick selection
- D3 vendored locally (downloaded file or inlined) — zero network requests
- If reading a CSV file, use `fetch` + `d3.csvParse`, or inline the data as a template literal

## Complete Bar Chart Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bar Chart</title>
  <style>
    body { font-family: sans-serif; }
    .axis text { font-size: 11px; }
  </style>
</head>
<body>
<script src="d3.min.js"></script>
<script>
const csvText = `product,revenue
Widgets,45000
Gadgets,38000`;

const data = d3.csvParse(csvText, d3.autoType);

const width = 800, height = 500;
const margin = { top: 40, right: 30, bottom: 60, left: 80 };
const innerWidth  = width  - margin.left - margin.right;
const innerHeight = height - margin.top  - margin.bottom;

const svg = d3.select("body").append("svg")
  .attr("width", width).attr("height", height);

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleBand()
  .domain(data.map(d => d.product))
  .range([0, innerWidth]).padding(0.2);

const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.revenue)]).nice()
  .range([innerHeight, 0]);

g.append("g").attr("transform", `translate(0,${innerHeight})`)
  .call(d3.axisBottom(xScale));

g.append("g").call(d3.axisLeft(yScale)
  .ticks(6).tickFormat(d => `$${d3.format(",d")(d)}`));

g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -60).attr("x", -innerHeight / 2)
  .attr("text-anchor", "middle").text("Revenue ($)");

g.selectAll(".bar").data(data).join("rect")
  .attr("x", d => xScale(d.product))
  .attr("y", d => yScale(d.revenue))
  .attr("width", xScale.bandwidth())
  .attr("height", d => innerHeight - yScale(d.revenue))
  .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

svg.append("text")
  .attr("x", width / 2).attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .style("font-size", "16px").style("font-weight", "bold")
  .text("Product Revenue");
</script>
</body>
</html>
```
