# Hand-ported 1:1 from skill-bench tasks/weather/weather-travel/task.ts
# (the three inline `custom` criteria; the fourth criterion, packing-advice,
# is an llm-judge criterion declared in task.json). Legacy weights were
# 0.2 / 0.3 / 0.15 out of a task total of 1.0 — here they are renormalized
# to sum 1.0 (x/0.65) and the python-grade criterion carries outer weight
# 0.65 in task.json. `response.text` was the agent's LAST assistant text.
import json
import re


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

    # city-references (legacy weight 0.2)
    city_score = 0.0
    if "chicago" in text:
        city_score += 0.5
    if "miami" in text:
        city_score += 0.5

    # weather-data (legacy weight 0.3): 4 sub-checks
    found = 0
    if any(p in text for p in ["°c", "°f", "celsius", "fahrenheit", "degrees"]):
        found += 1
    if any(p in text for p in ["warmer", "cooler", "colder", "hotter", "difference", "higher", "lower", "compared"]):
        found += 1
    if re.search(r"\d+", raw):
        found += 1
    weather_apis = ["wttr.in", "open-meteo", "api.weather.gov", "openweathermap", "weatherapi"]
    if any(api in tool_text for api in weather_apis):
        found += 1
    data_score = found / 4

    # temperature-difference (legacy weight 0.15)
    diff_score = 0.0
    diff_pattern = re.compile(r"\d+\s*°?\s*[FCfc].{0,80}(warmer|cooler|colder|hotter|difference|gap)", re.IGNORECASE)
    diff_pattern2 = re.compile(r"(warmer|cooler|colder|hotter|difference|gap).{0,80}\d+\s*°?\s*[FCfc]", re.IGNORECASE)
    if diff_pattern.search(raw) or diff_pattern2.search(raw):
        diff_score += 0.5
    if re.search(r"\d+\s*°\s*[FC]", raw, re.IGNORECASE):
        diff_score += 0.25
    if len(re.findall(r"\d+\s*°?\s*[FC]", raw, re.IGNORECASE)) >= 2:
        diff_score += 0.25
    diff_score = min(diff_score, 1.0)

    # weights renormalized from 0.2/0.3/0.15 (sum 0.65) to sum 1.0
    return [
        {"id": "city-references", "score": city_score, "weight": 0.307692,
         "description": "References correct cities",
         "details": None if city_score >= 1.0 else "missing Chicago and/or Miami"},
        {"id": "weather-data", "score": data_score, "weight": 0.461539,
         "description": "Contains real weather data from API calls",
         "details": None if data_score >= 1.0 else f"{found}/4 data checks passed"},
        {"id": "temperature-difference", "score": diff_score, "weight": 0.230769,
         "description": "Quantifies the temperature difference between cities",
         "details": None if diff_score >= 1.0 else f"scored {diff_score}"},
    ]
