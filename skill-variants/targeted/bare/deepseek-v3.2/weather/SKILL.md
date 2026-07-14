---
name: weather
description: "Get current weather and forecasts via wttr.in. Use when: user asks about weather, temperature, or forecasts for any location. No API key needed."
---

# Weather Skill

Fetch live weather using wttr.in (no API key needed).

## Fetching Weather Data

Use JSON format for structured data:

```bash
curl -s "wttr.in/CITY?format=j1"
```

Replace CITY with the location (use `+` for spaces: `New+York`).

## Key JSON Fields

The `j1` response contains:
- `current_condition[0]`: current weather
  - `temp_C`, `temp_F` — temperature
  - `humidity` — humidity percentage
  - `windspeedKmph`, `windspeedMiles` — wind speed
  - `weatherDesc[0].value` — condition text (e.g. "Sunny", "Partly cloudy", "Overcast", "Light rain")
  - `FeelsLikeC`, `FeelsLikeF` — feels like
  - `uvIndex` — UV index
  - `precipMM` — precipitation in mm
- `weather[]` — 3-day forecast with `maxtempC`, `mintempC`, `hourly[]`

## Quick One-Liner

```bash
curl -s "wttr.in/London?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity"
```

## Presenting Results

When comparing cities, ALWAYS use a markdown pipe table with `|`:

```
| City | Temperature | Humidity | Wind Speed | Conditions |
|------|-------------|----------|------------|------------|
| Tokyo | 18°C | 65% | 12 km/h | Partly cloudy |
```

Include the weather **conditions** column (Sunny, Cloudy, Rain, Clear, Overcast, etc.) — extract from `weatherDesc[0].value` in JSON or from the text output.

## Travel Comparisons

When comparing weather for travel:
1. Fetch weather for both cities
2. State the temperature difference explicitly (e.g. "Miami is 15°F warmer than Chicago")
3. Give specific packing items based on actual weather data
