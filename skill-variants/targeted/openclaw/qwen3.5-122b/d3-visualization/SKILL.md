---
name: d3-visualization
description: Build data visualizations as standalone HTML files with SVG. Use when creating bar charts, line charts, or any SVG-based data visualization.
---

# Chart Visualization — MANDATORY Instructions

**Output file MUST be named `chart.html`**.

**NEVER include CDN URLs in the final chart.html** (no cdn.jsdelivr.net, cdnjs.cloudflare.com, unpkg.com).

First, decide the chart type:
- "bar chart" or categories/products → go to **BAR CHART** section
- "line chart" or dates/timeseries → go to **LINE CHART** section

---

## BAR CHART

Bar charts MUST have literal `<rect>` tags in the HTML source. D3 creates elements dynamically so they won't appear in the source. Therefore, bar charts MUST use static SVG — no D3, no JavaScript, no `<script>` tags.

Follow these 2 steps exactly:

### Step 1: Read the CSV to learn column names

### Step 2: Run this Python command (it writes chart.html with static `<rect>` tags)

```bash
python3 -c "
import csv,sys
rows=list(csv.DictReader(open('INPUT_CSV')))
names=[r['NAME_COL'] for r in rows]
vals=[float(r['VALUE_COL']) for r in rows]
N=len(names);mx=max(vals);sw=690.0/N;bw=sw*0.8
colors='#1f77b4 #ff7f0e #2ca02c #d62728 #9467bd #8c564b #e377c2 #7f7f7f #bcbd22 #17becf'.split()
h='<!DOCTYPE html>\n<html><head><meta charset=\"utf-8\"></head><body>\n<svg width=\"800\" height=\"500\">\n'
h+='<text x=\"400\" y=\"25\" text-anchor=\"middle\" font-size=\"16\" font-weight=\"bold\">CHART_TITLE</text>\n'
h+='<text x=\"25\" y=\"270\" text-anchor=\"middle\" font-size=\"13\" transform=\"rotate(-90,25,270)\">Y_LABEL</text>\n'
h+='<line x1=\"80\" y1=\"40\" x2=\"80\" y2=\"440\" stroke=\"#333\"/>\n'
h+='<line x1=\"80\" y1=\"440\" x2=\"770\" y2=\"440\" stroke=\"#333\"/>\n'
for i in range(N):
 x=80+i*sw+sw*0.1;bh=(vals[i]/mx)*400;y=40+(400-bh)
 h+='<rect x=\"%.1f\" y=\"%.1f\" width=\"%.1f\" height=\"%.1f\" fill=\"%s\"/>\n'%(x,y,bw,bh,colors[i%10])
for i in range(N):
 lx=80+i*sw+sw/2
 h+='<text x=\"%.1f\" y=\"460\" text-anchor=\"middle\" font-size=\"11\">%s</text>\n'%(lx,names[i])
h+='</svg></body></html>'
open('chart.html','w').write(h)
print('Done:',N,'bars in chart.html')
"
```

Replace these 5 placeholders before running:
- `INPUT_CSV` → CSV filename (e.g. `sales.csv`)
- `NAME_COL` → category column name (e.g. `product`)
- `VALUE_COL` → numeric column name (e.g. `revenue`)
- `CHART_TITLE` → chart title (e.g. `Product Revenue`)
- `Y_LABEL` → y-axis label (e.g. `Revenue (\$)`)

That's it. The Python script reads the CSV, computes bar positions, and writes chart.html with one `<rect>` per data row. Do NOT modify the script. Do NOT also create the file manually. Do NOT download d3.min.js for bar charts.

---

## LINE CHART

Line charts use D3 for path computation. Do these 3 steps:

### Step 1: Read the CSV file to see the data

### Step 2: Download D3

```bash
curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js
```

### Step 3: Write chart.html

The file MUST contain these literal strings in its source:
- `<svg` tag
- `<path` tag (for the line)
- The year from the data (e.g. "2026")
- The chart title (e.g. "Daily Trend")

Embed ALL CSV rows as a JavaScript string inside chart.html. Do NOT skip any rows.

Use this exact template — only replace the csvText content, date labels, and title text:

```html
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>CHART_TITLE</title></head>
<body>
<svg id="chart" width="800" height="400">
<text x="400" y="25" text-anchor="middle" font-size="16" font-weight="bold">CHART_TITLE</text>
<g id="bindgroup" transform="translate(60,40)">
<path id="trendline" fill="none" stroke="steelblue" stroke-width="2" d=""/>
</g>
<text x="60" y="380" font-size="10">FIRST_DATE</text>
<text x="770" y="380" font-size="10" text-anchor="end">LAST_DATE</text>
<line x1="60" y1="340" x2="770" y2="340" stroke="#333"/>
<line x1="60" y1="40" x2="60" y2="340" stroke="#333"/>
</svg>
<script src="d3.min.js"></script>
<script>
var csvText = "date,value\nROW1\nROW2\n...ALL ROWS...";
var parseDate = d3.timeParse("%Y-%m-%d");
var data = d3.csvParse(csvText, function(d) { return {date: parseDate(d.date), value: +d.value}; });
var innerWidth = 710, innerHeight = 300;
var xScale = d3.scaleTime().domain(d3.extent(data, function(d){return d.date;})).range([0, innerWidth]);
var yScale = d3.scaleLinear().domain([d3.min(data, function(d){return d.value;})*0.9, d3.max(data, function(d){return d.value;})*1.1]).range([innerHeight, 0]);
var line = d3.line().x(function(d){return xScale(d.date);}).y(function(d){return yScale(d.value);}).curve(d3.curveMonotoneX);
d3.select("#trendline").attr("d", line(data));
</script>
</body></html>
```

Replace:
- CHART_TITLE → the requested title (e.g. "Daily Trend")
- FIRST_DATE → first date in CSV (e.g. "2026-01-01")
- LAST_DATE → last date in CSV (e.g. "2026-03-31")
- csvText → ALL rows from the CSV file, each on a new line separated by \n

Use `var` not `const`. Use `function(d){}` not arrow functions. This ensures compatibility.
