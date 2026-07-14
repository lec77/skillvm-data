---
name: weather
description: "Get current weather and forecasts via wttr.in. Use when: user asks about weather, temperature, or forecasts for any location. NOT for: historical weather data or severe weather alerts. No API key needed."
---

# Weather Skill

Fetch weather using wttr.in. No API key needed.

## RULES — READ BEFORE DOING ANYTHING

1. ALWAYS use `?format=j1` for weather data. NEVER use `?format=1`, `?format=3`, `?format=4`, or any other format. Only `j1` returns temperature AND humidity AND wind AND conditions in one request.

2. ALWAYS encode spaces as `+` in city names:
   - CORRECT: `wttr.in/New+York?format=j1`
   - WRONG: `wttr.in/New York?format=j1`
   - WRONG: `wttr.in/New%20York?format=j1`

3. ALWAYS present weather data DIRECTLY in your response text. NEVER write results to a file.

## How to Fetch Weather

Run this exact command pattern for each city:

```bash
curl -s "wttr.in/CITYNAME?format=j1"
```

Replace CITYNAME with the city, using `+` for spaces.

The response is JSON. The weather data is in `current_condition[0]`:

| JSON field | Meaning | Example |
|-----------|---------|---------|
| `temp_C` | Temperature °C | `"12"` |
| `temp_F` | Temperature °F | `"54"` |
| `humidity` | Humidity % | `"65"` |
| `windspeedKmph` | Wind km/h | `"14"` |
| `weatherDesc[0].value` | Conditions | `"Partly cloudy"` |
| `FeelsLikeC` | Feels like °C | `"10"` |
| `precipMM` | Precipitation mm | `"0.0"` |

## Task: Compare Weather Across Cities

Step 1: Fetch each city one at a time:
```bash
curl -s "wttr.in/Tokyo?format=j1"
```
Step 2: Read the JSON, extract `current_condition[0]` fields.
Step 3: Repeat for each city.
Step 4: Present this table in your response (fill in real values):

| City | Temp (°C/°F) | Humidity | Wind (km/h) | Conditions |
|------|-------------|----------|-------------|------------|
| Tokyo | 12°C (54°F) | 65% | 14 km/h | Partly cloudy |
| London | 8°C (46°F) | 82% | 20 km/h | Overcast |
| New York | 3°C (37°F) | 55% | 25 km/h | Clear |

You MUST include all 4 columns for every city. Get humidity from the `humidity` field in the JSON.

## Task: Travel Weather + Packing

Step 1: Fetch weather for both cities using `?format=j1`
Step 2: Present weather data for both cities
Step 3: State the exact temperature difference (e.g. "Miami is 25°F warmer than Chicago")
Step 4: Give packing recommendations based on the data:
- Cold city → layers, jacket, boots, hat/gloves
- Warm city → light clothes, sunscreen, sunglasses
- Rain → umbrella, rain jacket
- Connect each item to actual weather conditions
