---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula. Use when working with lat/lon coordinates, finding nearest points, or computing distance matrices.
---

# Geospatial Analysis

## Recommended Approach

Write a single Python script that reads input files, computes results, and writes the output JSON. Execute with `python3 script.py`. This is more reliable than reading files individually.

## Haversine Distance (Python)

```python
import math, csv, json

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    to_rad = math.pi / 180
    dlat = (lat2 - lat1) * to_rad
    dlon = (lon2 - lon1) * to_rad
    a = math.sin(dlat/2)**2 + math.cos(lat1*to_rad) * math.cos(lat2*to_rad) * math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))
```

## Bearing (Python)

```python
def bearing(lat1, lon1, lat2, lon2):
    to_rad = math.pi / 180
    dlon = (lon2 - lon1) * to_rad
    rlat1, rlat2 = lat1 * to_rad, lat2 * to_rad
    y = math.sin(dlon) * math.cos(rlat2)
    x = math.cos(rlat1) * math.sin(rlat2) - math.sin(rlat1) * math.cos(rlat2) * math.cos(dlon)
    return (math.degrees(math.atan2(y, x)) + 360) % 360
```

## Distance Matrix

For N points, compute all pairwise haversine distances. Diagonal is 0, matrix is symmetric.

## Closest Pairs

Collect unique pairs (i < j) with distances, sort ascending, take first K.

## Key Rules

- Always convert degrees to radians before sin/cos
- Never use Euclidean distance for lat/lon
- Bearing: 0=North, 90=East, 180=South, 270=West
- Read CSV headers to find correct column names (latitude/lat, longitude/lon, etc.)
