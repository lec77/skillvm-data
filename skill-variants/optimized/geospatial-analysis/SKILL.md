---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

## Haversine Distance (km)

Great-circle distance between two lat/lon points. **R = 6371 km**. Convert degrees to radians: `rad = deg * π / 180`.

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

Initial bearing from point 1 to point 2, clockwise from North.

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

Compute all pairwise haversine distances for N points. Diagonal = 0, matrix is symmetric.

## Nearest Point

Iterate candidates, compute haversine to each, track minimum distance.

## Pitfalls

- **Always convert degrees → radians** before sin/cos
- **Never use Euclidean distance** on lat/lon — use Haversine
- **Normalize bearing**: `(atan2_degrees + 360) % 360` for [0, 360)
- **lat/lon order**: ensure consistency (lat, lon) not (lon, lat)
