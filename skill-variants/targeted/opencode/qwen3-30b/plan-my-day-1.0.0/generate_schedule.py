#!/usr/bin/env python3
"""Read input.json and generate daily_plan.json with time-blocked schedule."""
import json

with open("input.json") as f:
    data = json.load(f)

date = data["date"]
wake = data["wake_time"]
end = data["end_time"]
commitments = data["fixed_commitments"]
tasks = data["tasks"]

def to_min(t):
    h, m = map(int, t.split(":"))
    return h * 60 + m

def to_time(m):
    return f"{m // 60:02d}:{m % 60:02d}"

start_min = to_min(wake)
end_min = to_min(end)

# Fixed commitment blocks
fixed_blocks = []
for c in commitments:
    fixed_blocks.append({
        "start_time": c["start_time"],
        "end_time": c["end_time"],
        "name": c["name"],
        "tasks": []
    })

# Sort tasks by priority
p1 = [t for t in tasks if t["priority"] == 1]
p2 = [t for t in tasks if t["priority"] == 2]
p3 = [t for t in tasks if t["priority"] == 3]

top_3 = [t["name"] for t in p1[:3]]

# Build occupied intervals from fixed commitments
occupied = [(to_min(c["start_time"]), to_min(c["end_time"])) for c in commitments]
occupied.sort()

# Find free slots
def find_free_slots(start, end, occupied):
    slots = []
    cur = start
    for os, oe in sorted(occupied):
        if cur < os:
            slots.append((cur, os))
        cur = max(cur, oe)
    if cur < end:
        slots.append((cur, end))
    return slots

free = find_free_slots(start_min, end_min, occupied)

# Schedule tasks into free slots
task_blocks = []
all_tasks_ordered = p1 + p2 + p3
slot_idx = 0
slot_used = 0  # minutes used in current slot

for task in all_tasks_ordered:
    mins = task["estimated_minutes"]
    while slot_idx < len(free):
        slot_start, slot_end = free[slot_idx]
        available = slot_end - (slot_start + slot_used)
        if available >= mins:
            block_start = slot_start + slot_used
            block_end = block_start + mins
            task_blocks.append({
                "start_time": to_time(block_start),
                "end_time": to_time(block_end),
                "name": task["name"],
                "tasks": [task["name"]]
            })
            slot_used += mins
            break
        else:
            slot_idx += 1
            slot_used = 0
    else:
        # No more free slots, shouldn't happen with proper input
        pass

# Combine and sort all blocks
all_blocks = fixed_blocks + task_blocks
all_blocks.sort(key=lambda b: to_min(b["start_time"]))

# Calculate totals
total_task_min = sum(t["estimated_minutes"] for t in tasks)
fixed_min = sum(to_min(c["end_time"]) - to_min(c["start_time"]) for c in commitments)
total_available = end_min - start_min
buffer_min = total_available - total_task_min - fixed_min
buffer_pct = round((buffer_min / total_available) * 100, 1)

primary_goal = "Complete high-priority work tasks and attend scheduled meetings"

plan = {
    "date": date,
    "primary_goal": primary_goal,
    "top_3_priorities": top_3,
    "time_blocks": all_blocks,
    "total_scheduled_minutes": total_task_min,
    "buffer_percentage": buffer_pct
}

with open("daily_plan.json", "w") as f:
    json.dump(plan, f, indent=2)

print("daily_plan.json created")
