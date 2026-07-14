---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

## Step-by-Step Workflow

When asked to compute distances between geographic coordinates:

1. **Read input data** (CSV/JSON with latitude and longitude columns)
2. **Convert degrees to radians** before any trig: `radians = degrees * Math.PI / 180`
3. **Apply Haversine formula** with R = 6371 km
4. **Compute bearing** if requested using atan2 formula
5. **Write output** as JSON with exact field names requested

## Haversine Distance Formula

Computes great-circle distance in km between two lat/lon points:

```python
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    to_rad = math.pi / 180
    dlat = (lat2 - lat1) * to_rad
    dlon = (lon2 - lon1) * to_rad
    a = math.sin(dlat/2)**2 + math.cos(lat1*to_rad) * math.cos(lat2*to_rad) * math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))
```

**CRITICAL**: Always convert degrees to radians BEFORE calling sin/cos. Forgetting this is the #1 error.

## Bearing Calculation

Initial bearing from point 1 to point 2 (0°=North, 90°=East, 180°=South, 270°=West):

```python
def bearing(lat1, lon1, lat2, lon2):
    to_rad = math.pi / 180
    to_deg = 180 / math.pi
    dlon = (lon2 - lon1) * to_rad
    rlat1 = lat1 * to_rad
    rlat2 = lat2 * to_rad
    y = math.sin(dlon) * math.cos(rlat2)
    x = math.cos(rlat1) * math.sin(rlat2) - math.sin(rlat1) * math.cos(rlat2) * math.cos(dlon)
    return (math.atan2(y, x) * to_deg + 360) % 360
```

**CRITICAL**: Normalize bearing to [0, 360) by adding 360 and taking modulo 360.

## Distance Matrix

For N points, compute all pairwise distances:

```python
def distance_matrix(points):
    n = len(points)
    matrix = [[0.0]*n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                matrix[i][j] = haversine(points[i]['lat'], points[i]['lon'],
                                          points[j]['lat'], points[j]['lon'])
    return matrix
```

Properties: diagonal is always 0, matrix is symmetric.

## Finding Closest Pairs

After computing the distance matrix, find the K closest pairs:

```python
pairs = []
for i in range(n):
    for j in range(i+1, n):  # only upper triangle to avoid duplicates
        pairs.append((points[i]['name'], points[j]['name'], matrix[i][j]))
pairs.sort(key=lambda x: x[2])
closest_k = pairs[:k]
```

## Finding Nearest Point

Given a query point and list of candidates, find the one with minimum Haversine distance:

```python
def nearest_point(query_lat, query_lon, candidates):
    best = None
    best_dist = float('inf')
    for c in candidates:
        d = haversine(query_lat, query_lon, c['latitude'], c['longitude'])
        if d < best_dist:
            best_dist = d
            best = c
    return best, best_dist
```

## Output Format Rules

- Write JSON output files with **exactly** the field names specified in the prompt
- Use number types for distances and bearings (not strings)
- Round distances to reasonable precision (2+ decimal places)
- For distance matrices: rows and columns must follow the same order as the input data
- For closest pairs: sort by distance ascending
