---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

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

R = 6371 km. Convert degrees to radians before trig functions.

## Bearing (0–360°)

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

0° = North, 90° = East, 180° = South, 270° = West.

## Distance Matrix

Compute all pairwise distances. Diagonal = 0, matrix is symmetric.

```ts
function distanceMatrix(points: {lat: number, lon: number}[]): number[][] {
  const n = points.length;
  const m: number[][] = Array.from({length: n}, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      m[i][j] = m[j][i] = haversine(points[i].lat, points[i].lon, points[j].lat, points[j].lon);
  return m;
}
```

## Nearest Point

```ts
function nearestPoint(query: {lat: number, lon: number}, candidates: {lat: number, lon: number}[]) {
  let minDist = Infinity, nearest = candidates[0];
  for (const c of candidates) {
    const d = haversine(query.lat, query.lon, c.lat, c.lon);
    if (d < minDist) { minDist = d; nearest = c; }
  }
  return { point: nearest, distance: minDist };
}
```
