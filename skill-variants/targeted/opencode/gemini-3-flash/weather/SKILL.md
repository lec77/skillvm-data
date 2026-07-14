---
name: weather
description: "Get current weather and forecasts via wttr.in. Use when: user asks about weather, temperature, or forecasts for any location. NOT for: historical weather data, severe weather alerts, or detailed meteorological analysis. No API key needed."
homepage: https://wttr.in/:help
metadata: { "openclaw": { "emoji": "🌤️", "requires": { "bins": ["curl"] } } }
---

# Weather Skill

Get current weather conditions and forecasts via wttr.in. No API key needed.

## Commands

```bash
# One-line summary
curl "wttr.in/London?format=3"

# Current conditions only
curl "wttr.in/London?0"

# JSON output (best for structured data / comparisons)
curl "wttr.in/London?format=j1"

# Custom format
curl "wttr.in/London?format=%l:+%c+%t+%w+%h"

# 3-day forecast
curl "wttr.in/London"
```

**Format codes:** `%c` condition emoji, `%C` condition text (e.g. "Partly cloudy"), `%t` temp, `%f` feels-like, `%w` wind, `%h` humidity, `%p` precipitation, `%l` location.

**Spaces in city names:** use `+` → `curl "wttr.in/New+York?format=j1"`

## Important

**You MUST actually execute curl commands** to fetch real weather data. Never fabricate or guess weather information. Run the curl commands and use the real output.

## Output Guidelines

- Always describe weather conditions with **text words** (e.g. "Sunny", "Partly cloudy", "Rain") not just emojis.
- When comparing multiple cities, use a **markdown table** with columns: City, Temperature, Humidity, Wind Speed, Conditions.
- For travel/packing advice, quantify the temperature difference and give **specific item-level** packing lists per destination.

## Notes

- Works for most global cities and airport codes (e.g. `wttr.in/ORD`)
- Rate limited; don't spam requests
