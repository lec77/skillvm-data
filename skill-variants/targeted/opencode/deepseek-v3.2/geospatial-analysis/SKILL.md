---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

## Haversine Formula

Great-circle distance between two lat/lon points:

```
d = 2R * arcsin( sqrt( sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2) ) )
```

- **R** = 6371 km (Earth's mean radius)
- Convert degrees to radians: `radians = degrees * Math.PI / 180`

### TypeScript Implementation

```ts
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (x: number) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
```

## Bearing Calculation

Initial bearing from point 1 to point 2 (0–360°, clockwise from North):

```ts
function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => x * Math.PI / 180;
  const toDeg = (x: number) => x * 180 / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const rlat1 = toRad(lat1);
  const rlat2 = toRad(lat2);
  const y = Math.sin(dLon) * Math.cos(rlat2);
  const x = Math.cos(rlat1) * Math.sin(rlat2) - Math.sin(rlat1) * Math.cos(rlat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
```

## Distance Matrix

Compute all pairwise distances for N points. Result is an N×N 2D array where `matrix[i][j]` = haversine distance between point i and point j.

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

Properties: diagonal is 0, matrix is symmetric.

## Finding Closest Pairs

To find the K closest pairs from a distance matrix:

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

Find the nearest candidate to a query point:

```ts
function nearestPoint(query: {lat: number, lon: number}, candidates: {lat: number, lon: number}[]) {
  let minDist = Infinity;
  let nearestIdx = 0;
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
- **Read CSV carefully**: use the correct column names for lat/lon
- **Write valid JSON output**: use `JSON.stringify(result, null, 2)` and write with `fs.writeFileSync`
