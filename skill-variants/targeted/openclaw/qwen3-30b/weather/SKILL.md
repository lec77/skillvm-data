---
name: weather
description: "Get current weather and forecasts via wttr.in. Use when: user asks about weather, temperature, or forecasts for any location. No API key needed."
homepage: https://wttr.in/:help
metadata: { "openclaw": { "emoji": "🌤️", "requires": { "bins": ["curl"] } } }
---

# Weather Skill

Get weather data using `curl` and wttr.in. **Always use curl with wttr.in — never use web_search.**

## Fetching Weather

Use `exec` to run curl commands. Always use wttr.in URLs. The one-line format gives you everything you need — do NOT make additional JSON API calls unless specifically asked for forecast data.

### Current weather (one-line — use this by default)

```bash
curl -s "wttr.in/CityName?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity"
```

### 3-day forecast (only if forecast is needed)

```bash
curl "wttr.in/CityName"
```

## Multi-city queries

Fetch each city separately with its own curl command. For spaces in city names use `+`:

```bash
curl -s "wttr.in/New+York?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity"
```

## Presenting Results

### Comparisons

When comparing cities, ALWAYS:
1. Show data for each city (temperature, feels-like, humidity, wind, conditions)
2. **Calculate and state the exact temperature difference** (e.g., "Miami is 32°F warmer than Chicago")
3. Use a markdown table with columns: City | Temp | Feels Like | Humidity | Wind | Conditions

### Travel/Packing advice

When giving packing recommendations:
1. First show weather data for both cities in a comparison table
2. **Explicitly state the temperature difference** (e.g., "Miami is 32°F warmer than Chicago")
3. Give a **specific item-level packing list** organized by city/climate:
   - **For the colder city**: warm layers, jacket/coat, scarf, long pants — cite the temperature (e.g., "a warm jacket for Chicago's 46°F and 28mph wind")
   - **For the warmer city**: light clothing, shorts, sun protection (sunscreen, hat, sunglasses), rain gear if humid — cite the data (e.g., "sunscreen for Miami's high UV at 78°F")
4. **Every packing item must reference the weather**: tie items to temperature, wind, humidity, or conditions. Never give generic advice without connecting to data.

## Format Codes

- `%c` — condition emoji
- `%t` — temperature
- `%f` — feels like
- `%w` — wind
- `%h` — humidity
- `%p` — precipitation
- `%l` — location

## Notes

- No API key needed
- Works for most global cities
- Supports airport codes: `curl wttr.in/ORD`
