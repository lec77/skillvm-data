#!/usr/bin/env python3
"""Read tasks.json and generate priority_report.json."""
import json
from datetime import datetime

with open("tasks.json") as f:
    data = json.load(f)

tasks = data["tasks"]

# Determine today from the prompt context - look for tasks with earliest deadline
# The prompt says "today's date is" followed by a date, but we detect from data
# Find the earliest deadline to infer today
deadlines = sorted(set(t["deadline"] for t in tasks))
today = deadlines[0]  # Earliest deadline is today

must_do = []
should_do = []
nice_to_have = []
deferred = []
reasoning = {}

today_dt = datetime.strptime(today, "%Y-%m-%d")

for t in tasks:
    name = t["name"]
    dl = t["deadline"]
    impact = t["impact"]
    effort = t["effort"]
    dl_dt = datetime.strptime(dl, "%Y-%m-%d")
    days_away = (dl_dt - today_dt).days

    if dl == today and impact == "high":
        must_do.append(name)
        reasoning[name] = f"Deadline is today and impact is high"
    elif days_away >= 5 and impact == "low":
        deferred.append(name)
        reasoning[name] = f"Deadline is {days_away} days away and impact is low"
    elif impact == "high" or days_away <= 1:
        should_do.append(name)
        if impact == "high":
            reasoning[name] = f"High impact task with deadline in {days_away} days"
        else:
            reasoning[name] = f"Deadline is tomorrow, should not delay"
    else:
        nice_to_have.append(name)
        reasoning[name] = f"Not urgent (deadline in {days_away} days) and {impact} impact"

report = {
    "must_do_today": must_do,
    "should_do": should_do,
    "nice_to_have": nice_to_have,
    "deferred": deferred,
    "reasoning": reasoning
}

with open("priority_report.json", "w") as f:
    json.dump(report, f, indent=2)

print("priority_report.json created")
