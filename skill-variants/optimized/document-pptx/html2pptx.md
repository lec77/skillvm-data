# HTML to PowerPoint Guide

Convert HTML slides to PowerPoint using `html2pptx.js` + PptxGenJS.

## HTML Slide Rules

**Dimensions** (set on body): 16:9 = `720pt x 405pt`, 4:3 = `720pt x 540pt`

**Supported elements**: `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, `<b>`/`<strong>`, `<i>`/`<em>`, `<u>`, `<span>` (for inline color/bold/italic), `<br>`, `<div>` (shapes), `<img>`, `class="placeholder"` (chart areas)

**Critical rules**:
- ALL text MUST be in `<p>`, `<h1>`-`<h6>`, `<ul>`, or `<ol>`. Text in bare `<div>` or `<span>` is silently ignored.
- NEVER use manual bullet symbols (•, -, *) — use `<ul>`/`<ol>` lists
- ONLY web-safe fonts: Arial, Helvetica, Times New Roman, Georgia, Courier New, Verdana, Tahoma, Trebuchet MS, Impact
- NEVER use CSS gradients — rasterize to PNG via Sharp first
- Backgrounds, borders, shadows only work on `<div>` elements, not text tags
- Use `display: flex` on body to prevent margin collapse
- Use hex colors with `#` prefix in CSS

**`<span>` inline formatting**: supports `font-weight: bold`, `font-style: italic`, `text-decoration: underline`, `color: #rrggbb`. Does NOT support margin/padding.

### Example
```html
<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif; display: flex; }
.content { margin: 30pt; padding: 40pt; background: #ffffff; border-radius: 8pt; }
h1 { color: #2d3748; font-size: 32pt; }
</style></head>
<body>
<div class="content">
  <h1>Title</h1>
  <ul><li><b>Item:</b> Description</li></ul>
  <p>Text with <b>bold</b> and <i>italic</i>.</p>
  <div id="chart" class="placeholder" style="width: 350pt; height: 200pt;"></div>
</div>
</body></html>
```

## html2pptx API

```javascript
const pptxgen = require('pptxgenjs');
const html2pptx = require('./html2pptx');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';  // Must match HTML dimensions

const { slide, placeholders } = await html2pptx('slide1.html', pptx);
// placeholders: [{ id, x, y, w, h }]

// Add chart to placeholder
slide.addChart(pptx.charts.BAR, chartData, { ...placeholders[0], showTitle: true, title: 'Chart' });

await pptx.writeFile({ fileName: 'output.pptx' });
```

Options: `{ tmpDir: string, slide: existingSlide }`

Validation is automatic: dimension mismatches, overflow, gradient usage, text element styling errors are all reported together.

## PptxGenJS Reference

### Colors: NEVER use `#` prefix — causes file corruption
- Correct: `color: "FF0000"`, `fill: { color: "0066CC" }`
- Wrong: `color: "#FF0000"`

### Charts

```javascript
// Bar chart
slide.addChart(pptx.charts.BAR, [{
    name: "Sales", labels: ["Q1","Q2","Q3","Q4"], values: [4500,5500,6200,7100]
}], {
    ...placeholders[0], barDir: 'col',
    showTitle: true, title: 'Quarterly Sales',
    showCatAxisTitle: true, catAxisTitle: 'Quarter',
    showValAxisTitle: true, valAxisTitle: 'Sales ($K)',
    chartColors: ["4472C4"]
});

// Line chart
slide.addChart(pptx.charts.LINE, [{
    name: "Temp", labels: ["Jan","Feb","Mar"], values: [32,35,42]
}], { x:1, y:1, w:8, h:4, lineSize:4, chartColors: ["4472C4","ED7D31"] });

// Pie chart (single series, no axis labels)
slide.addChart(pptx.charts.PIE, [{
    name: "Share", labels: ["A","B","C"], values: [35,45,20]
}], { x:2, y:1, w:6, h:4, showPercent:true, showLegend:true, chartColors: ["4472C4","ED7D31","A5A5A5"] });

// Scatter (first series = X values, others = Y values)
slide.addChart(pptx.charts.SCATTER, [
    { name: 'X-Axis', values: allXValues },
    { name: 'Series 1', values: yValues1 }
], { lineSize:0, lineDataSymbol:'circle' });
```

Time series: <30 days = daily, 30-365 = monthly, >365 = yearly. Charts with 1 data point likely have wrong aggregation.

### Tables

```javascript
slide.addTable([
    [{ text:"Header", options:{ fill:{color:"4472C4"}, color:"FFFFFF", bold:true } }],
    ["Row 1 data"]
], { x:1, y:1.5, w:8, h:3, colW:[3,2.5,2.5], border:{pt:1,color:"CCCCCC"} });
```

Supports `colspan`, `align`, `valign`, `fontSize`, `autoPage`.

### Images
```javascript
const aspectRatio = imgWidth / imgHeight;
const h = 3, w = h * aspectRatio, x = (10 - w) / 2;
slide.addImage({ path: "img.png", x, y: 1.5, w, h });
```

### Shapes
```javascript
slide.addShape(pptx.shapes.RECTANGLE, { x:1, y:1, w:3, h:2, fill:{color:"4472C4"} });
slide.addShape(pptx.shapes.OVAL, { x:5, y:1, w:2, h:2, fill:{color:"ED7D31"} });
```

### Text
```javascript
slide.addText([
    { text:"Bold ", options:{bold:true} },
    { text:"Normal" }
], { x:1, y:2, w:8, h:1 });
```
