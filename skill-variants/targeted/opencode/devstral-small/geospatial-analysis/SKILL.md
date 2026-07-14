---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

IMPORTANT: For any geospatial task, write a single Node.js script that reads input files, computes results, and writes the output JSON file. Then run it with `node script.js`. Do NOT try to do calculations manually or in multiple steps.

## Complete Haversine + Bearing Script

Write this exact code into your script, then add task-specific logic after it:

```js
const fs = require('fs');

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function bearing(lat1, lon1, lat2, lon2) {
  const toRad = x => x * Math.PI / 180;
  const dLon = toRad(lon2 - lon1);
  const rlat1 = toRad(lat1), rlat2 = toRad(lat2);
  const y = Math.sin(dLon) * Math.cos(rlat2);
  const x = Math.cos(rlat1) * Math.sin(rlat2) - Math.sin(rlat1) * Math.cos(rlat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
```

## Pattern: Distance Matrix + Closest Pairs

When computing a distance matrix from a CSV of locations:

```js
// Parse CSV (skip header)
const lines = fs.readFileSync('INPUT.csv', 'utf8').trim().split('\n');
const header = lines[0].split(',');
const latIdx = header.indexOf('latitude');
const lonIdx = header.indexOf('longitude');
const nameIdx = header.indexOf('city') >= 0 ? header.indexOf('city') : header.indexOf('name');
const points = lines.slice(1).map(l => {
  const cols = l.split(',');
  return { name: cols[nameIdx], lat: parseFloat(cols[latIdx]), lon: parseFloat(cols[lonIdx]) };
});

// Build NxN distance matrix
const n = points.length;
const matrix = Array.from({length: n}, () => new Array(n).fill(0));
for (let i = 0; i < n; i++)
  for (let j = 0; j < n; j++)
    if (i !== j) matrix[i][j] = haversine(points[i].lat, points[i].lon, points[j].lat, points[j].lon);

// Find K closest pairs
const pairs = [];
for (let i = 0; i < n; i++)
  for (let j = i+1; j < n; j++)
    pairs.push({ city1: points[i].name, city2: points[j].name, distance_km: matrix[i][j] });
pairs.sort((a, b) => a.distance_km - b.distance_km);

fs.writeFileSync('OUTPUT.json', JSON.stringify({ matrix, closest_pairs: pairs.slice(0, 3) }, null, 2));
```

## Pattern: Nearest Point + Bearing

When finding the nearest point from a set of candidates:

```js
// Read query point
const query = JSON.parse(fs.readFileSync('query.json', 'utf8'));
const qLat = query.latitude, qLon = query.longitude;

// Parse candidates CSV
const lines = fs.readFileSync('candidates.csv', 'utf8').trim().split('\n');
const header = lines[0].split(',');
const candidates = lines.slice(1).map(l => {
  const cols = l.split(',');
  const obj = {};
  header.forEach((h, i) => obj[h.trim()] = cols[i].trim());
  obj.latitude = parseFloat(obj.latitude);
  obj.longitude = parseFloat(obj.longitude);
  return obj;
});

// Find nearest
let minDist = Infinity, nearest = null;
for (const c of candidates) {
  const d = haversine(qLat, qLon, c.latitude, c.longitude);
  if (d < minDist) { minDist = d; nearest = c; }
}

const b = bearing(qLat, qLon, nearest.latitude, nearest.longitude);
fs.writeFileSync('OUTPUT.json', JSON.stringify({
  nearest_point: { id: parseInt(nearest.id), name: nearest.name, latitude: nearest.latitude, longitude: nearest.longitude },
  distance_km: minDist,
  bearing_degrees: b
}, null, 2));
```

## Steps

1. Read the input files to understand their format
2. Write a single complete .js script combining the haversine/bearing functions above with the appropriate pattern
3. Run the script with `node script.js`
4. Verify the output file was created
