---
name: weather
description: "Get current weather and forecasts via Open-Meteo API. Use when: user asks about weather, temperature, forecasts, or travel weather for any location. No API key needed."
homepage: https://open-meteo.com/
metadata: { "openclaw": { "emoji": "🌤️", "requires": { "bins": ["curl"] } } }
---

# Weather Skill

## IMPORTANT: Always Use Open-Meteo API

Do NOT use wttr.in. Use the Open-Meteo API — it is free, reliable, and needs no API key.

## How to Fetch Weather

Run this curl command for each city. Replace LATITUDE and LONGITUDE with values from the table below:

```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=LATITUDE&longitude=LONGITUDE&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

### City Coordinates

| City | Latitude | Longitude |
|------|----------|-----------|
| Tokyo | 35.6762 | 139.6503 |
| London | 51.5074 | -0.1278 |
| New York | 40.7128 | -74.0060 |
| Chicago | 41.8781 | -87.6298 |
| Miami | 25.7617 | -80.1918 |
| Paris | 48.8566 | 2.3522 |
| Los Angeles | 34.0522 | -118.2437 |
| Sydney | -33.8688 | 151.2093 |

For cities not listed: look up their latitude and longitude.

### Example Commands

Tokyo:
```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

London:
```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

New York:
```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

Chicago:
```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

Miami:
```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=25.7617&longitude=-80.1918&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

## Reading the API Response

The API returns JSON. Use these fields:

- `current.temperature_2m` → Temperature in °C
- `current.relative_humidity_2m` → Humidity in %
- `current.wind_speed_10m` → Wind speed in km/h
- `current.weather_code` → Condition code (see table below)
- `current.apparent_temperature` → Feels like in °C

Convert °C to °F: multiply by 9/5 then add 32.
Convert km/h to mph: multiply by 0.621.

## Weather Code Lookup

| Code | Condition |
|------|-----------|
| 0 | Clear sky |
| 1 | Mainly clear |
| 2 | Partly cloudy |
| 3 | Overcast |
| 45 | Fog |
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
| 95 | Thunderstorm |

## Output Format

### For comparing cities, use a markdown table:

```
| Metric | City1 | City2 | City3 |
|--------|-------|-------|-------|
| Temperature | X°C (Y°F) | ... | ... |
| Humidity | X% | ... | ... |
| Wind Speed | X km/h (Y mph) | ... | ... |
| Conditions | Clear sky | ... | ... |
```

Always include:
- Temperature in BOTH °C and °F
- Wind speed in BOTH km/h and mph
- Humidity with % symbol
- Conditions as text words, not code numbers
- Use markdown table with | separators

### For travel/packing advice:

1. Fetch weather for BOTH cities using the API
2. Show a comparison table (same format as above)
3. MUST explicitly state the temperature difference with a number, like: "Miami is 14.5°C (26°F) warmer than Chicago"
4. MUST provide a detailed packing list that references the actual weather data. Example format:

**Temperature difference:** Miami is X°C (Y°F) warmer than Chicago.

**Packing list for Chicago (X°C / Y°F, [conditions]):**
- Heavy winter jacket and warm layers for the cold temperatures
- Gloves, scarf, and warm hat (temperatures near freezing)
- Warm boots or closed-toe shoes

**Packing list for Miami (X°C / Y°F, [conditions]):**
- Light, breathable clothing (t-shirts, shorts) for the warm weather
- Sunscreen (SPF 30+) and sunglasses — essential for high UV in warm destinations
- Light rain jacket or umbrella (tropical destinations often have rain showers)
- Sandals or light shoes
- Hat or cap for sun protection

**Key:** Always mention specific temperatures from the data next to each city's packing section. Always list at least 3 specific items per city. Always connect items to the weather (e.g., "jacket for the 2°C cold").
