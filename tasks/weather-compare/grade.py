# Hand-ported 1:1 from skill-bench tasks/weather/weather-compare/task.ts
# (inline TypeScript `custom` evaluate closures). Legacy semantics preserved:
# `response.text` was the agent's LAST assistant text (bare-agent lastText),
# and tool-call checks scan the JSON of every tool-call input. The
# per-city-completeness check intentionally keeps the legacy quirk of testing
# temp/wind/humidity against the whole text rather than a per-city window.
import json
import re

CITIES = ["tokyo", "london", "new york"]


def _last_assistant_text(transcript):
    texts = []
    for entry in transcript:
        msg = entry.get("message", {})
        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "text" and item.get("text"):
                    texts.append(item["text"])
    return texts[-1] if texts else ""


def _all_tool_input_text(transcript):
    parts = []
    for entry in transcript:
        msg = entry.get("message", {})
        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "toolCall":
                    parts.append(json.dumps(item.get("params", {})))
    return " ".join(parts).lower()


def grade(transcript, workspace_path):
    raw = _last_assistant_text(transcript)
    text = raw.lower()
    tool_text = _all_tool_input_text(transcript)

    # city-mentions (legacy weight 0.25)
    found_cities = sum(1 for c in CITIES if c in text)
    city_score = found_cities / len(CITIES)

    # api-call-made (legacy weight 0.20)
    weather_apis = ["wttr.in", "open-meteo", "api.weather.gov", "openweathermap", "weatherapi"]
    if any(api in tool_text for api in weather_apis):
        api_score = 1.0
    elif ("curl" in tool_text or "fetch" in tool_text) and "weather" in tool_text:
        api_score = 0.75
    else:
        api_score = 0.0

    # weather-metrics (legacy weight 0.35): 6 sub-checks
    metric_patterns = {
        "temperature": ["°c", "°f", "celsius", "fahrenheit"],
        "humidity": ["humidity"],
        "wind": ["wind", "km/h", "mph", "m/s"],
        "conditions": ["sunny", "cloudy", "rain", "overcast", "clear", "partly", "fog", "snow", "mist", "patchy"],
    }
    found = 0
    for patterns in metric_patterns.values():
        if any(p in text for p in patterns):
            found += 1
    if "|" in text:
        found += 1
    if len(re.findall(r"\d+(?:\.\d+)?", raw)) >= 6:
        found += 1
    metrics_score = found / 6

    # per-city-completeness (legacy weight 0.20)
    has_temp = any(p in text for p in ["°c", "°f", "celsius", "fahrenheit"])
    has_wind = any(p in text for p in ["km/h", "mph", "m/s", "wind"])
    has_humidity = "humidity" in text or "%" in text
    city_complete = 0
    for c in CITIES:
        if c not in text:
            continue
        if has_temp and has_wind and has_humidity:
            city_complete += 1
    completeness_score = city_complete / len(CITIES)

    return [
        {"id": "city-mentions", "score": city_score, "weight": 0.25,
         "description": "Mentions all three cities",
         "details": None if city_score >= 1.0 else f"{found_cities}/3 cities mentioned"},
        {"id": "api-call-made", "score": api_score, "weight": 0.20,
         "description": "Made API calls to fetch real weather data",
         "details": None if api_score >= 1.0 else "no recognized weather API in tool calls"},
        {"id": "weather-metrics", "score": metrics_score, "weight": 0.35,
         "description": "Contains weather metrics with numeric data per city",
         "details": None if metrics_score >= 1.0 else f"{found}/6 metric checks passed"},
        {"id": "per-city-completeness", "score": completeness_score, "weight": 0.20,
         "description": "Each city has temperature and wind data nearby",
         "details": None if completeness_score >= 1.0 else f"{city_complete}/3 cities complete"},
    ]
