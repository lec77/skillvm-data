---
name: geospatial-analysis
description: Compute geographic distances, bearings, and spatial relationships using the Haversine formula.
---

# Geospatial Analysis

## CRITICAL WORKFLOW

**You MUST follow this exact workflow for any geospatial computation:**

1. **Read** the input files to understand the data format
2. **Write** a complete Python script to a `.py` file that reads inputs, computes, and writes the output JSON
3. **Execute** the script with `python3 script.py` using your shell/bash tool
4. **Never** compute distances manually or write output JSON directly — always use a script

## Distance Matrix Script

For computing pairwise distances between points in a CSV, write this to `compute.py` and run it:

```python
import math, json, csv

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))

with open('cities.csv') as f:
    cities = list(csv.DictReader(f))

n = len(cities)
matrix = [[0.0]*n for _ in range(n)]
for i in range(n):
    for j in range(n):
        if i != j:
            matrix[i][j] = haversine(
                float(cities[i]['latitude']), float(cities[i]['longitude']),
                float(cities[j]['latitude']), float(cities[j]['longitude']))

pairs = []
for i in range(n):
    for j in range(i+1, n):
        pairs.append({
            'city1': cities[i]['city'],
            'city2': cities[j]['city'],
            'distance_km': round(matrix[i][j], 2)
        })
pairs.sort(key=lambda p: p['distance_km'])

with open('distances.json', 'w') as f:
    json.dump({'matrix': matrix, 'closest_pairs': pairs[:3]}, f)

print('Done')
```

## Nearest Point + Bearing Script

For finding the nearest point and computing bearing, write this to `compute.py` and run it:

```python
import math, json, csv

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))

def bearing(lat1, lon1, lat2, lon2):
    dlon = math.radians(lon2 - lon1)
    rlat1, rlat2 = math.radians(lat1), math.radians(lat2)
    y = math.sin(dlon) * math.cos(rlat2)
    x = math.cos(rlat1) * math.sin(rlat2) - math.sin(rlat1) * math.cos(rlat2) * math.cos(dlon)
    return (math.degrees(math.atan2(y, x)) + 360) % 360

with open('earthquake.json') as f:
    eq = json.load(f)

with open('boundaries.csv') as f:
    boundaries = list(csv.DictReader(f))

query_lat = float(eq['latitude'])
query_lon = float(eq['longitude'])
min_dist = float('inf')
nearest = None
for b in boundaries:
    d = haversine(query_lat, query_lon, float(b['latitude']), float(b['longitude']))
    if d < min_dist:
        min_dist = d
        nearest = b

b = bearing(query_lat, query_lon, float(nearest['latitude']), float(nearest['longitude']))

with open('result.json', 'w') as f:
    json.dump({
        'nearest_point': {
            'id': int(nearest['id']),
            'name': nearest['name'],
            'latitude': float(nearest['latitude']),
            'longitude': float(nearest['longitude'])
        },
        'distance_km': round(min_dist, 2),
        'bearing_degrees': round(b, 2)
    }, f)

print('Done')
```

## Key Formulas

- **Haversine**: `d = 2R * arcsin(sqrt(sin²(Δlat/2) + cos(lat1)*cos(lat2)*sin²(Δlon/2)))`, R=6371 km
- **Bearing**: `atan2(sin(Δlon)*cos(lat2), cos(lat1)*sin(lat2) - sin(lat1)*cos(lat2)*cos(Δlon))`, normalize to [0,360)
- Always convert degrees to radians before trig functions
- Distance matrix diagonal = 0, matrix is symmetric
