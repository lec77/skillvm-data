---
name: weather
description: "Get current weather and forecasts via wttr.in using curl. Use when: user asks about weather, temperature, forecasts, or travel packing for any location. No API key needed."
homepage: https://wttr.in/:help
metadata: { "openclaw": { "emoji": "🌤️", "requires": { "bins": ["curl"] } } }
---

# Weather Skill

## CRITICAL: How to Fetch Weather

**ALWAYS use the `exec` tool to run curl commands.** NEVER use `web_search` or `web_fetch` — they will fail.

Example of the CORRECT way:
```
Tool: exec
Input: { "command": "curl -s \"wttr.in/Chicago?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity\"" }
```

WRONG (will fail):
- `web_search` → requires API key, will error
- `web_fetch` → blocked by IP filter, will error

If you get an error, switch to `exec` with `curl`. Do NOT retry `web_search` or `web_fetch`.

## Fetching Weather for Any City

Use `exec` to run this curl command for each city (replace CityName, use `+` for spaces):

```bash
curl -s "wttr.in/CityName?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity"
```

Examples:
```bash
curl -s "wttr.in/Chicago?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity"
curl -s "wttr.in/Miami?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity"
curl -s "wttr.in/Tokyo?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity"
curl -s "wttr.in/London?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity"
curl -s "wttr.in/New+York?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity"
```

## Presenting Comparison Results

When comparing cities, present a markdown table:

| City | Conditions | Temperature | Feels Like | Humidity | Wind |
|------|-----------|-------------|------------|----------|------|
| Chicago | ☀️ | +39°F | +32°F | 45% | →12mph |
| Miami | ⛅️ | +78°F | +80°F | 72% | ↗8mph |

## Travel & Packing Advice

When a user asks about travel between cities, follow this EXACT structure:

1. Fetch weather for BOTH cities using `exec` with curl (as shown above)
2. Present a comparison table with data for both cities
3. **Calculate and state the exact temperature difference** — e.g., "Miami is 39°F warmer than Chicago"
4. Give a **detailed, specific packing list** with these sections:

### Packing for [Cold City] (X°F, feels like Y°F):
- **Heavy jacket or winter coat** — essential for the X°F temperature and Y mph wind chill
- **Layered clothing** (thermal base layer + sweater + outer shell) — the feels-like Y°F means wind cuts through single layers
- **Warm accessories**: scarf, gloves, and warm hat for Z mph winds
- **Long pants and closed-toe shoes** — avoid exposed skin in the cold
- **Warm socks** — keep feet insulated against the cold ground

### Packing for [Warm City] (X°F, feels like Y°F):
- **Light, breathable clothing** (cotton t-shirts, shorts, sundresses) — X°F and Z% humidity means you'll sweat
- **Sunscreen (SPF 30+)** and **sunglasses** — UV exposure is high at this temperature
- **Wide-brimmed hat** — protects against direct sun
- **Light rain jacket or umbrella** — Z% humidity means afternoon showers are likely
- **Sandals or breathable shoes** — keep feet cool in the heat
- **Moisture-wicking fabrics** — essential to manage Z% humidity

### Transition items:
- **Versatile layers** you can add/remove on travel day (the X°F temperature difference is significant)
- **Comfortable travel outfit** that works in both climates

IMPORTANT: Every single packing item MUST cite a specific number from the weather data (temperature, wind speed, humidity percentage). Never give generic advice without referencing the actual data.

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
- Use `+` for spaces in city names: `New+York`
