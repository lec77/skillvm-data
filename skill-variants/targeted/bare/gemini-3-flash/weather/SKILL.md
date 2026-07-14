---
name: weather
description: "Get current weather and forecasts via wttr.in. Use when: user asks about weather, temperature, or forecasts for any location. No API key needed."
homepage: https://wttr.in/:help
metadata: { "openclaw": { "emoji": "🌤️", "requires": { "bins": ["curl"] } } }
---

# Weather Skill

Fetch weather via wttr.in using curl. No API key needed.

## RULES

1. ALWAYS use `curl` to fetch from `wttr.in`
2. For multi-word cities, use `+` as separator: `New+York`, not spaces or `%20`
3. Use `?format=j1` to get JSON with all metrics in one request
4. ALWAYS present weather data in a **markdown table** using `|` characters
5. Include temperature with °F or °C symbols, humidity with %, and wind speed with units

## Fetching Weather

```bash
# Fetch JSON weather data for a city
curl -s "wttr.in/Tokyo?format=j1"
```

The JSON response contains `current_condition[0]` with these fields:
- `temp_C`, `temp_F` — temperature
- `humidity` — humidity percentage
- `windspeedKmph`, `windspeedMiles` — wind speed
- `weatherDesc[0].value` — condition description
- `FeelsLikeC`, `FeelsLikeF` — feels-like temperature
- `uvIndex` — UV index
- `precipMM` — precipitation in mm

## Multi-City Comparison

When comparing multiple cities:
1. Fetch each city separately with `?format=j1`
2. Extract `current_condition[0]` values from each JSON response
3. Present in a markdown table:

```
| City | Temperature | Humidity | Wind | Conditions |
|------|-------------|----------|------|------------|
| Tokyo | 22°C (72°F) | 65% | 15 km/h | Sunny |
```

## Travel Weather

When advising on travel between cities:
1. Fetch weather for both departure and destination cities
2. Compare temperatures and note the difference in degrees (e.g., "Miami is 15°F warmer than Chicago")
3. Use comparison words: warmer, cooler, colder, hotter
4. Give specific packing recommendations based on the weather difference:
   - Hot destination: light clothing, sunscreen, sunglasses, hat
   - Cold departure: warm layers, jacket, coat
   - Rain expected: umbrella, rain jacket
   - Beach/UV: swimwear, sun protection
