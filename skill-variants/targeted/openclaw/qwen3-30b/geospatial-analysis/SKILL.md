---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

## Haversine Formula

Great-circle distance between two points on Earth (R = 6371 km):

```
d = 2R * arcsin( sqrt( sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2) ) )
```

- Convert degrees to radians: `radians = degrees * π / 180`
- Δlat = lat2 − lat1, Δlon = lon2 − lon1 (in radians)

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

Initial bearing from point 1 to point 2 (0°=North, 90°=East, 180°=South, 270°=West):

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

## IMPORTANT: Always Write a Script

For any task involving Haversine distances or bearings, you MUST write a Node.js script and execute it. Do NOT try to compute these values mentally.

Write the script, run it with `node script.js`, then verify the output.

When writing scripts, use `JSON.stringify(result, null, 2)` to write output JSON files.

## Common Pitfalls

- **Forgetting degree-to-radian conversion**: Always multiply degrees by `π/180` before `sin`/`cos`.
- **atan2 normalization**: Add 360° and take modulo 360 to get bearing in [0°, 360°).
- **Latitude vs longitude order**: Be consistent with (lat, lon) ordering.
