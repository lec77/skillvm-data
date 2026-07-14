---
name: d3-visualization
description: Build D3.js charts as standalone HTML. Vendor D3 locally. Write static SVG tags.
---

# D3 Chart Instructions

## Setup
Run: `curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js`

## Rules
- Output: `chart.html`
- NEVER put CDN URLs in the HTML. Use `<script src="d3.min.js"></script>`
- `<svg>`, `<rect>`, `<path>` MUST be literal HTML tags, not JS-generated

## Bar Chart
Write static `<svg width="800" height="500">` containing `<rect>` elements for each bar.
Margins: top=40,right=30,bottom=60,left=80. Compute positions from data values.

## Line Chart
Write static `<svg>` and `<path id="line">` tags. Embed data as JS array. Use D3 to set path d:

```html
<svg width="800" height="400">
  <text x="400" y="25" text-anchor="middle" font-size="16" font-weight="bold">TITLE HERE</text>
  <g id="chart" transform="translate(80,40)">
    <path id="line" d="" fill="none" stroke="steelblue" stroke-width="2"/>
    <g id="xaxis" transform="translate(0,300)"></g>
    <g id="yaxis"></g>
  </g>
</svg>
<script>
const data = [/* {date:"2026-01-01",value:100}, ... all rows */];
const pd = d3.timeParse("%Y-%m-%d");
data.forEach(d=>{d.d=pd(d.date);d.value=+d.value});
const x=d3.scaleTime().domain(d3.extent(data,d=>d.d)).range([0,690]);
const y=d3.scaleLinear().domain(d3.extent(data,d=>d.value)).nice().range([300,0]);
d3.select("#line").attr("d",d3.line().x(d=>x(d.d)).y(d=>y(d.value)).curve(d3.curveMonotoneX)(data));
d3.select("#xaxis").call(d3.axisBottom(x).ticks(6));
d3.select("#yaxis").call(d3.axisLeft(y));
</script>
```
