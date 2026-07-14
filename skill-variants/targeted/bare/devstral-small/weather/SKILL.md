---
name: weather
description: "Fetch weather data using Python urllib. ALWAYS use execute_command to run a Python script that fetches from wttr.in. NEVER just describe what you would do - execute the code."
---

# Weather Skill

Fetch weather using Python and wttr.in. No API key needed.

**IMPORTANT: Use execute_command to run Python scripts. Do NOT just describe steps - EXECUTE them.**

## Fetch Weather for One City

```python
python3 -c "
import urllib.request, json
data = json.loads(urllib.request.urlopen('https://wttr.in/London?format=j1').read())
c = data['current_condition'][0]
print(f\"Temperature: {c['temp_F']}°F ({c['temp_C']}°C)\")
print(f\"Feels like: {c['FeelsLikeF']}°F\")
print(f\"Humidity: {c['humidity']}%\")
print(f\"Wind: {c['windspeedKmph']} km/h\")
print(f\"Conditions: {c['weatherDesc'][0]['value']}\")
"
```

## Compare Multiple Cities

```python
python3 -c "
import urllib.request, json

cities = ['Tokyo', 'London', 'New+York']
display = ['Tokyo', 'London', 'New York']
print('| City | Temp (°F) | Humidity | Wind (km/h) | Conditions |')
print('|------|-----------|----------|-------------|------------|')
for i, city in enumerate(cities):
    url = f'https://wttr.in/{city}?format=j1'
    data = json.loads(urllib.request.urlopen(url).read())
    c = data['current_condition'][0]
    print(f\"| {display[i]} | {c['temp_F']}°F | {c['humidity']}% | {c['windspeedKmph']} | {c['weatherDesc'][0]['value']} |\")
"
```

## Travel Weather Comparison

```python
python3 -c "
import urllib.request, json

def get_weather(city):
    url = f'https://wttr.in/{city}?format=j1'
    data = json.loads(urllib.request.urlopen(url).read())
    return data['current_condition'][0]

origin = get_weather('Chicago')
dest = get_weather('Miami')
diff = int(dest['temp_F']) - int(origin['temp_F'])
print(f\"Chicago: {origin['temp_F']}°F, {origin['weatherDesc'][0]['value']}, humidity {origin['humidity']}%\")
print(f\"Miami: {dest['temp_F']}°F, {dest['weatherDesc'][0]['value']}, humidity {dest['humidity']}%\")
print(f\"Temperature difference: Miami is {abs(diff)}°F {'warmer' if diff > 0 else 'cooler'} than Chicago\")
"
```

After running the script, provide packing recommendations based on the actual data:
- Cold origin: warm layers, jacket, scarf
- Warm destination: light clothing, sunscreen, sunglasses
- Rain: umbrella, rain jacket
