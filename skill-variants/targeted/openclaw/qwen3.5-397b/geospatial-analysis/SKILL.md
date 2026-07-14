---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

## Haversine Formula

The Haversine formula computes the great-circle distance between two points on a sphere given their latitude and longitude in degrees.

```
d = 2R * arcsin( sqrt( sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2) ) )
```

- **R** = 6371 km (Earth's mean radius)
- **Δlat** = lat2 − lat1 (in radians)
- **Δlon** = lon2 − lon1 (in radians)
- All latitude/longitude inputs must be converted to radians before use

### Degree-to-Radian Conversion

```
radians = degrees * π / 180
```

### Implementation (JavaScript/TypeScript)

```ts
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const toRad = (x: number) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
```

### Implementation (Python)

```python
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    to_rad = math.pi / 180
    dlat = (lat2 - lat1) * to_rad
    dlon = (lon2 - lon1) * to_rad
    a = math.sin(dlat/2)**2 + math.cos(lat1*to_rad) * math.cos(lat2*to_rad) * math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))
```

## Bearing Calculation

The initial bearing from point 1 to point 2 (clockwise from North, 0–360°):

```
bearing = atan2(
  sin(Δlon) * cos(lat2),
  cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(Δlon)
)
```

Convert the result from radians to degrees, then normalize to [0, 360):

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

Bearings: 0° = North, 90° = East, 180° = South, 270° = West.

## Distance Matrix

To compute all pairwise distances for N points:

```ts
function distanceMatrix(points: Array<{lat: number, lon: number}>): number[][] {
  const n = points.length;
  const matrix: number[][] = Array.from({length: n}, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        matrix[i][j] = haversine(points[i].lat, points[i].lon, points[j].lat, points[j].lon);
      }
    }
  }
  return matrix;
}
```

Properties:
- Diagonal is always 0 (distance from a point to itself)
- Matrix is symmetric: `matrix[i][j] === matrix[j][i]`

## Nearest Point Search

Iterate all candidates, track the minimum distance:

```ts
function nearestPoint<T extends {lat: number, lon: number}>(
  query: {lat: number, lon: number},
  candidates: T[]
): { point: T; distance: number } {
  let minDist = Infinity;
  let nearest = candidates[0];
  for (const c of candidates) {
    const d = haversine(query.lat, query.lon, c.lat, c.lon);
    if (d < minDist) { minDist = d; nearest = c; }
  }
  return { point: nearest, distance: minDist };
}
```

## K-Nearest Neighbors

Sort all candidates by distance, take the first K:

```ts
function kNearest<T extends {lat: number, lon: number}>(
  query: {lat: number, lon: number},
  candidates: T[],
  k: number
): Array<{ point: T; distance: number }> {
  return candidates
    .map(c => ({ point: c, distance: haversine(query.lat, query.lon, c.lat, c.lon) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);
}
```

## Common Pitfalls

- **Forgetting degree-to-radian conversion**: Haversine requires radians. Always multiply degrees by `π/180` before calling `sin`/`cos`.
- **Using Euclidean distance for lat/lon**: Straight-line distance in degree-space is wrong because longitude degrees shrink near the poles. Always use Haversine.
- **atan2 normalization**: `atan2` returns values in (−π, π]. Add 360° and take modulo 360 to get a bearing in [0°, 360°).
- **Latitude vs longitude order**: Many APIs take (lat, lon) but some take (lon, lat). Be consistent.
- **Floating-point symmetry**: Due to floating-point arithmetic, `matrix[i][j]` and `matrix[j][i]` may differ by a tiny epsilon; they should be treated as equal.
