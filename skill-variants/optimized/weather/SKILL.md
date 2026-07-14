---
name: weather
description: "Get current weather and forecasts via Open-Meteo API. Use when: user asks about weather, temperature, forecasts, or travel weather for any location. Covers current conditions, multi-day forecasts, and city comparisons. No API key needed."
homepage: https://open-meteo.com/
metadata: { "openclaw": { "emoji": "🌤️", "requires": { "bins": ["curl", "python3"] } } }
---

# Weather Skill

## CRITICAL: How to Fetch Weather Data

NEVER use wttr.in — it is unreliable and frequently times out. ALWAYS use **Open-Meteo API** which requires no API key and works reliably.

## Step 1: Fetch Weather Data

For EACH city, run this curl command (replace latitude and longitude):

```bash
curl -s --max-time 15 "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

### City Coordinates (MUST use these exact values)

| City | Latitude | Longitude |
|------|----------|-----------|
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

### Example: Fetch Tokyo, London, New York

```bash
curl -s --max-time 15 "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

```bash
curl -s --max-time 15 "https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

```bash
curl -s --max-time 15 "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

## Step 2: Parse the JSON Response

The API returns JSON like this:

```json
{
  "current": {
    "temperature_2m": 4.1,
    "relative_humidity_2m": 54,
    "apparent_temperature": 1.2,
    "weather_code": 1,
    "wind_speed_10m": 4.0,
    "wind_direction_10m": 225
  }
}
```

Extract these fields:
- **Temperature**: `current.temperature_2m` (°C). Convert to °F: multiply by 9/5 then add 32.
- **Humidity**: `current.relative_humidity_2m` (%)
- **Wind speed**: `current.wind_speed_10m` (km/h). Convert to mph: multiply by 0.621371.
- **Conditions**: `current.weather_code` — look up in the table below.

## Step 3: Format the Comparison Table

ALWAYS present weather data in this EXACT markdown table format:

```
| Metric | Tokyo | London | New York |
|--------|-------|--------|----------|
| Temperature | 4.1°C (39.4°F) | 10.2°C (50.4°F) | 19.3°C (66.7°F) |
| Humidity | 54% | 90% | 41% |
| Wind Speed | 4.0 km/h (2.5 mph) | 20.9 km/h (13.0 mph) | 8.7 km/h (5.4 mph) |
| Conditions | Mainly clear | Dense drizzle | Clear sky |
```

MUST include:
- Temperature in BOTH °C and °F
- Wind speed in BOTH km/h and mph
- Humidity as percentage
- Conditions as text (not code number)

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

## Output Rules

- ALWAYS use real data from the API — NEVER guess or make up weather data
- ALWAYS report both °C and °F for temperature
- ALWAYS report both km/h and mph for wind speed
- ALWAYS include humidity as a percentage with % symbol
- ALWAYS use a markdown table with `|` separators for comparisons
- ALWAYS include data source: "Data source: Open-Meteo API"
