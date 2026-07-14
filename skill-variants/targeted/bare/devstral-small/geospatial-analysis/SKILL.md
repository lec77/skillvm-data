---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

Use these TypeScript functions for all geospatial calculations. Earth radius R = 6371 km.

## Haversine Distance (km)

```ts
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (x: number) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
```

## Bearing (0–360°)

Initial bearing from point A to point B, clockwise from North.

```ts
function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => x * Math.PI / 180;
  const dLon = toRad(lon2 - lon1);
  const rlat1 = toRad(lat1), rlat2 = toRad(lat2);
  const y = Math.sin(dLon) * Math.cos(rlat2);
  const x = Math.cos(rlat1) * Math.sin(rlat2) - Math.sin(rlat1) * Math.cos(rlat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
```

## Distance Matrix

For N points, compute all pairwise haversine distances. Diagonal = 0, matrix is symmetric.

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

## Nearest Point Search

```ts
function nearestPoint(queryLat: number, queryLon: number, candidates: {lat: number, lon: number}[]): {index: number, distance: number} {
  let minDist = Infinity, minIdx = 0;
  for (let i = 0; i < candidates.length; i++) {
    const d = haversine(queryLat, queryLon, candidates[i].lat, candidates[i].lon);
    if (d < minDist) { minDist = d; minIdx = i; }
  }
  return {index: minIdx, distance: minDist};
}
```

## Rules

- Always convert degrees to radians before sin/cos: `rad = deg * π / 180`
- Never use Euclidean distance on lat/lon — always use Haversine
- Normalize bearing: `(degrees + 360) % 360`
- Ensure consistent (lat, lon) order — not (lon, lat)
- Write output as JSON using `JSON.stringify(data, null, 2)`
