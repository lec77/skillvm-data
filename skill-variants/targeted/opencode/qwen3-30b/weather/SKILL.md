---
name: weather
description: "Get current weather and forecasts via wttr.in. Use when: user asks about weather, temperature, or forecasts for any location. No API key needed."
homepage: https://wttr.in/:help
---

# Weather Skill

Fetch live weather using curl and wttr.in. Always use bash with curl — never use other tools.

## Step-by-step

1. **Fetch weather with curl** — always use `curl -s "wttr.in/CITY?format=j1"` for JSON data
2. **Parse the JSON** — extract temperature_C, humidity, windspeedKmph, weatherDesc from the response
3. **Present results** — use a markdown table for comparisons; use degree symbols (°C/°F)
4. **Quantify differences** — when comparing cities, state the exact temperature difference (e.g., "Miami is 12°C warmer than Chicago")
5. **Give specific advice** — tie recommendations directly to the weather data

## Commands

```bash
# JSON weather data (best for parsing)
curl -s "wttr.in/London?format=j1"

# One-line summary
curl -s "wttr.in/London?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity"

# Multi-city: run one curl per city
curl -s "wttr.in/Tokyo?format=%l:+%t+%h+%w+%c"
curl -s "wttr.in/London?format=%l:+%t+%h+%w+%c"
```

## Comparing cities

When comparing weather between cities:
- Fetch each city separately with curl
- Build a markdown table with columns: City | Temperature | Humidity | Wind Speed | Conditions
- State the numeric difference: "City A is X°C warmer/colder than City B"
- Include feels-like temperature if available

## Travel/packing advice

When giving packing recommendations:
- State the temperature difference between origin and destination explicitly
- List specific items for EACH location based on actual temperature and conditions:
  - Cold (<10°C): warm jacket, layers, scarf, gloves, thermal underwear
  - Mild (10-20°C): light jacket, sweater, long pants
  - Warm (>20°C): light clothing, shorts, sunscreen, sunglasses, hat
- Mention rain gear if humidity >80% or conditions show rain/clouds
- Mention sun protection if conditions are sunny/clear
- Connect each recommendation to the data: "Since Miami is 18°C with 84% humidity, pack light breathable clothing and rain gear"

## Format codes

- `%c` condition emoji, `%t` temperature, `%f` feels-like, `%w` wind, `%h` humidity, `%p` precipitation, `%l` location

## Notes

- No API key needed
- Use `+` for spaces in city names: `New+York`
- Works for most global cities and airport codes
