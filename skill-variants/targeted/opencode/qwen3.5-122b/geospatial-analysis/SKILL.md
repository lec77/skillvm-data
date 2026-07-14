---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

**IMPORTANT: Always write and execute a script to compute distances and bearings. Never estimate or mentally calculate.**

## Workflow

1. Read input files (CSV/JSON) and parse coordinates
2. Write a Node.js/TypeScript script implementing the formulas below
3. Execute the script to produce exact numeric results
4. Write output as JSON with `JSON.stringify(result, null, 2)`

## Haversine Distance

```ts
const R = 6371; // Earth radius in km
const toRad = (d: number) => d * Math.PI / 180;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
```

## Bearing (0–360°, clockwise from North)

```ts
function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = toRad(lon2 - lon1);
  const rlat1 = toRad(lat1), rlat2 = toRad(lat2);
  const y = Math.sin(dLon) * Math.cos(rlat2);
  const x = Math.cos(rlat1) * Math.sin(rlat2) - Math.sin(rlat1) * Math.cos(rlat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
```

## Distance Matrix

Compute N×N pairwise distances. Diagonal = 0, matrix is symmetric.

```ts
function distanceMatrix(points: {lat: number, lon: number}[]): number[][] {
  const n = points.length;
  const matrix: number[][] = Array.from({length: n}, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversine(points[i].lat, points[i].lon, points[j].lat, points[j].lon);
      matrix[i][j] = d;
      matrix[j][i] = d;
    }
  }
  return matrix;
}
```

## Finding K Closest Pairs from a Distance Matrix

```ts
function closestPairs(names: string[], matrix: number[][], k: number) {
  const pairs: {city1: string, city2: string, distance_km: number}[] = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix.length; j++) {
      pairs.push({ city1: names[i], city2: names[j], distance_km: matrix[i][j] });
    }
  }
  pairs.sort((a, b) => a.distance_km - b.distance_km);
  return pairs.slice(0, k);
}
```

## Nearest Point Search

```ts
function nearestPoint(query: {lat: number, lon: number}, candidates: {lat: number, lon: number}[]) {
  let minDist = Infinity, nearestIdx = 0;
  for (let i = 0; i < candidates.length; i++) {
    const d = haversine(query.lat, query.lon, candidates[i].lat, candidates[i].lon);
    if (d < minDist) { minDist = d; nearestIdx = i; }
  }
  return { index: nearestIdx, distance: minDist };
}
```

## Key Rules

- **Always convert degrees to radians** before sin/cos: `degrees * Math.PI / 180`
- **Never use Euclidean distance** for lat/lon — longitude degrees shrink near poles
- **Normalize bearing** to [0, 360): `(degrees + 360) % 360`
- **Read CSV carefully**: check column order for lat/lon fields
- **Write valid JSON**: use `JSON.stringify(result, null, 2)` and `fs.writeFileSync`
- **Always run computation as code** — never estimate distances or bearings
