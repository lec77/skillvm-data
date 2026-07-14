---
name: weather
description: "Get current weather and forecasts via Open-Meteo API. Use when: user asks about weather, temperature, forecasts, travel weather, or packing advice for any location. Covers current conditions, multi-day forecasts, city comparisons, and travel recommendations. No API key needed."
---

# Weather Skill

Fetch real weather data from Open-Meteo API and present it clearly.

## CRITICAL RULES

- NEVER use wttr.in — it is unreliable. ALWAYS use Open-Meteo API.
- NEVER guess or fabricate weather data. ALWAYS fetch real data via curl.
- ALWAYS present comparisons in a markdown table with `|` separators.
- ALWAYS include temperature in BOTH °C and °F.
- ALWAYS include wind speed in BOTH km/h and mph.
- ALWAYS include humidity as a percentage.
- ALWAYS convert weather_code to a human-readable condition using the lookup table below.

## Step-by-Step Procedure

### Step 1: Identify Cities and Get Coordinates

Use these coordinates. For unlisted cities, look up latitude/longitude online.

| City | Latitude | Longitude |
|------|----------|-----------|
| Tokyo | 35.6762 | 139.6503 |
| London | 51.5074 | -0.1278 |
| New York | 40.7128 | -74.0060 |
| Chicago | 41.8781 | -87.6298 |
| Miami | 25.7617 | -80.1918 |
| Paris | 48.8566 | 2.3522 |
| Sydney | -33.8688 | 151.2093 |
| Los Angeles | 34.0522 | -118.2437 |
| San Francisco | 37.7749 | -122.4194 |
| Berlin | 52.5200 | 13.4050 |
| Dubai | 25.2048 | 55.2708 |
| Seoul | 37.5665 | 126.9780 |
| Toronto | 43.6532 | -79.3832 |
| Singapore | 1.3521 | 103.8198 |

### Step 2: Fetch Weather Data

For EACH city, run one curl command. Example for Tokyo:

```bash
curl -s --max-time 15 "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh"
```

The response JSON looks like:

```json
{
  "current": {
    "temperature_2m": 22.5,
    "relative_humidity_2m": 65,
    "apparent_temperature": 21.0,
    "weather_code": 2,
    "wind_speed_10m": 12.3
  }
}
```

### Step 3: Convert Weather Code to Text

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

### Step 4: Convert Units

- °C to °F: `(°C × 9/5) + 32`
- km/h to mph: `km/h × 0.621371`

### Step 5: Present Results

#### For multi-city comparison, ALWAYS use this table format:

```
| Metric | City1 | City2 | City3 |
|--------|-------|-------|-------|
| Temperature | 22.5°C (72.5°F) | 15.0°C (59.0°F) | 28.3°C (82.9°F) |
| Humidity | 65% | 80% | 55% |
| Wind Speed | 12.3 km/h (7.6 mph) | 8.5 km/h (5.3 mph) | 15.0 km/h (9.3 mph) |
| Conditions | Partly cloudy | Overcast | Clear sky |
```

#### For travel/packing advice:

After showing the comparison table, ALWAYS:
1. State the temperature difference explicitly: "Miami is X°F warmer than Chicago"
2. Give specific packing items for BOTH cities:
   - For the colder city: warm layers, jacket, long pants
   - For the warmer city: light clothing, shorts, sunscreen, sunglasses
3. Mention rain gear if either city shows rain/drizzle/showers
4. Connect each packing item to the weather data

Example packing section:
```
## Packing Recommendations

Chicago is currently 5°C (41°F) while Miami is 28°C (82°F) — a difference of 23°C (41°F).

**For Chicago (departure):**
- Warm jacket and layers (5°C / 41°F)
- Long pants and closed-toe shoes

**For Miami (destination):**
- Light, breathable clothing (28°C / 82°F)
- Shorts and sandals
- Sunscreen and sunglasses (clear sky conditions)
- Light rain jacket (slight rain showers expected)
```

## For Forecast Requests

Add forecast parameters to the API call:

```bash
curl -s --max-time 15 "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&temperature_unit=celsius&forecast_days=7"
```
