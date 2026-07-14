---
name: weather
description: "Get current weather and forecasts via Open-Meteo API. Use when: user asks about weather, temperature, forecasts, or travel weather for any location. Covers current conditions, multi-day forecasts, city comparisons, and travel packing advice. No API key needed."
homepage: https://open-meteo.com/
---

# Weather Skill

## CRITICAL: Use Open-Meteo API Only

NEVER use wttr.in — it times out. ALWAYS use the **Open-Meteo API** (no API key needed).

## Step 1: Get Coordinates

Use these coordinates for common cities:

| City | Lat | Lon |
|------|-----|-----|
| Tokyo | 35.6762 | 139.6503 |
| London | 51.5074 | -0.1278 |
| New York | 40.7128 | -74.0060 |
| Paris | 48.8566 | 2.3522 |
| Sydney | -33.8688 | 151.2093 |
| Chicago | 41.8781 | -87.6298 |
| Miami | 25.7617 | -80.1918 |
| San Francisco | 37.7749 | -122.4194 |
| Los Angeles | 34.0522 | -118.2437 |
| Berlin | 52.5200 | 13.4050 |
| Dubai | 25.2048 | 55.2708 |
| Singapore | 1.3521 | 103.8198 |
| Seoul | 37.5665 | 126.9780 |
| Toronto | 43.6532 | -79.3832 |

## Step 2: Fetch Weather Data

For EACH city, run this curl command with the city's coordinates:

```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

### Examples

Tokyo:
```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

Chicago:
```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

Miami:
```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=25.7617&longitude=-80.1918&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

## Step 3: Parse the JSON Response

The API returns:

```json
{
  "current": {
    "temperature_2m": 4.1,
    "relative_humidity_2m": 54,
    "apparent_temperature": 1.2,
    "weather_code": 1,
    "wind_speed_10m": 4.0
  }
}
```

Extract:
- **Temperature**: `current.temperature_2m` (°C) → convert to °F: `°C × 9/5 + 32`
- **Humidity**: `current.relative_humidity_2m` (%)
- **Wind Speed**: `current.wind_speed_10m` (km/h) → convert to mph: `km/h × 0.621`
- **Conditions**: `current.weather_code` → look up in WMO table below

## Step 4: Present Results

### For city comparisons, use this markdown table format:

| Metric | City1 | City2 | City3 |
|--------|-------|-------|-------|
| Temperature | X°C (Y°F) | ... | ... |
| Humidity | X% | ... | ... |
| Wind Speed | X km/h (Y mph) | ... | ... |
| Conditions | Clear sky | ... | ... |

### For travel/packing requests:

1. Show weather data for BOTH cities in a comparison table (same format as above)
2. State the temperature difference explicitly: "City A is X°F warmer/colder than City B"
3. Give specific packing recommendations based on the actual weather data:
   - For the departure city: what to wear leaving (jacket, layers, etc.)
   - For the destination city: what to pack (light clothes, sunscreen, rain gear, etc.)
   - Mention specific items tied to the conditions (e.g., "Pack sunscreen — Miami is sunny at 85°F" or "Bring a warm jacket — Chicago is 35°F with wind")

## WMO Weather Codes

| Code | Condition |
|------|-----------|
| 0 | Clear sky |
| 1 | Mainly clear |
| 2 | Partly cloudy |
| 3 | Overcast |
| 45 | Fog |
| 48 | Rime fog |
| 51 | Light drizzle |
| 53 | Moderate drizzle |
| 55 | Dense drizzle |
| 61 | Slight rain |
| 63 | Moderate rain |
| 65 | Heavy rain |
| 71 | Slight snow |
| 73 | Moderate snow |
| 75 | Heavy snow |
| 80 | Slight rain showers |
| 81 | Moderate rain showers |
| 82 | Violent rain showers |
| 95 | Thunderstorm |

## Rules

- ALWAYS fetch real data from the API — NEVER make up weather data
- ALWAYS show temperature in BOTH °C and °F
- ALWAYS show wind speed in BOTH km/h and mph
- ALWAYS show humidity with % symbol
- ALWAYS use markdown tables with `|` for comparisons
- ALWAYS translate weather_code to human-readable condition text
- Add "Data source: Open-Meteo API" at the end
