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

For bar charts, generate chart.html using a Python script. Do exactly these 2 steps:

### Step 1: Read the CSV to understand column names and data

### Step 2: Run a Python command to generate chart.html

Execute this command (adapt csv_file, name_col, value_col, and title):

```bash
python3 -c "
import csv
rows=list(csv.DictReader(open('sales.csv')))
names=[r['product'] for r in rows]
vals=[float(r['revenue']) for r in rows]
N=len(names);mx=max(vals);sw=690.0/N;bw=sw*0.8
colors=['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf']
h='<!DOCTYPE html>\n<html><head><meta charset=\"utf-8\"></head><body>\n<svg width=\"800\" height=\"500\">\n'
h+='<text x=\"400\" y=\"25\" text-anchor=\"middle\" font-size=\"16\" font-weight=\"bold\">Product Revenue</text>\n'
h+='<text x=\"25\" y=\"270\" text-anchor=\"middle\" font-size=\"13\" transform=\"rotate(-90,25,270)\">Revenue (\$)</text>\n'
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
print('Generated chart.html with',N,'bars')
"
```

Change `sales.csv` to the actual CSV filename, `product` and `revenue` to the actual column names, and `Product Revenue` and `Revenue (\$)` to the requested title and axis label.

**IMPORTANT: Do NOT download d3.min.js for bar charts. Do NOT write chart.html directly. Let the Python command generate it.**

---

## LINE CHART

Line charts use D3 for path computation. Do these 3 steps:

### Step 1: Read the CSV file

### Step 2: Download D3

```bash
curl -o d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js
```

### Step 3: Write chart.html

The file MUST contain `<svg`, `<path`, the year (e.g. "2026"), and the chart title.

Embed ALL CSV rows as a JavaScript string. Do NOT skip rows.

Use this template — replace csvText content, date labels, and title:

```html
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Daily Trend</title></head>
<body>
<svg id="chart" width="800" height="400">
<text x="400" y="25" text-anchor="middle" font-size="16" font-weight="bold">Daily Trend</text>
<g id="bindgroup" transform="translate(60,40)">
<path id="trendline" fill="none" stroke="steelblue" stroke-width="2" d=""/>
</g>
<text x="60" y="380" font-size="10">2026-01-01</text>
<text x="770" y="380" font-size="10" text-anchor="end">2026-03-31</text>
<line x1="60" y1="340" x2="770" y2="340" stroke="#333"/>
<line x1="60" y1="40" x2="60" y2="340" stroke="#333"/>
</svg>
<script src="d3.min.js"></script>
<script>
var csvText = "date,value\n2026-01-01,100\n2026-01-02,105";
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

Replace csvText with ALL rows from the actual CSV. Use `var` not `const`. Use `function(d){}` not arrow functions.
