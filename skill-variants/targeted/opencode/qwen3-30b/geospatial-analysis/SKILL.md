---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

## CRITICAL: Always Write and Run a Script

NEVER compute distances or bearings in your head. ALWAYS:
1. Read input files
2. Write a Node.js script called `solve.js`
3. Run it with `node solve.js`
4. Verify the output file exists

Do NOT delegate to subtasks. Do the work directly.

## Script Template

Use `require` (NOT `import`). Always use this exact pattern:

```js
const fs = require('fs');

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function bearing(lat1, lon1, lat2, lon2) {
  const toRad = (d) => d * Math.PI / 180;
  const toDeg = (r) => r * 180 / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);
  const y = Math.sin(dLon) * Math.cos(rLat2);
  const x = Math.cos(rLat1) * Math.sin(rLat2) - Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
```

## Reading CSV Files

```js
const lines = fs.readFileSync('file.csv', 'utf8').trim().split('\n');
const rows = lines.slice(1).map(line => {
  const parts = line.split(',');
  return { name: parts[0], lat: parseFloat(parts[1]), lon: parseFloat(parts[2]) };
});
```

## Distance Matrix

For N points, build N×N array. Diagonal is 0.

```js
const matrix = [];
for (let i = 0; i < points.length; i++) {
  const row = [];
  for (let j = 0; j < points.length; j++) {
    row.push(i === j ? 0 : haversine(points[i].lat, points[i].lon, points[j].lat, points[j].lon));
  }
  matrix.push(row);
}
```

## Finding Closest Pairs

```js
const pairs = [];
for (let i = 0; i < points.length; i++) {
  for (let j = i + 1; j < points.length; j++) {
    pairs.push({ city1: points[i].name, city2: points[j].name, distance_km: matrix[i][j] });
  }
}
pairs.sort((a, b) => a.distance_km - b.distance_km);
const closest = pairs.slice(0, 3);
```

## Finding Nearest Point

```js
let minDist = Infinity;
let nearest = null;
for (const p of candidates) {
  const d = haversine(query.lat, query.lon, p.lat, p.lon);
  if (d < minDist) { minDist = d; nearest = p; }
}
```

## Writing Output

```js
fs.writeFileSync('output.json', JSON.stringify(result, null, 2));
```

## Key Rules

- R = 6371 km (Earth's mean radius)
- Convert degrees to radians: `degrees * Math.PI / 180`
- Bearing: 0=North, 90=East, 180=South, 270=West. Normalize with `(deg + 360) % 360`
- Distance matrix diagonal is always 0
- Matrix is symmetric: `matrix[i][j] === matrix[j][i]`
