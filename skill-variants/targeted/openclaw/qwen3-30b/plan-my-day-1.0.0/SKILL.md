---
name: plan-my-day
description: Generate an energy-optimized, time-blocked daily plan
version: 1.0.0
author: theflohart
tags: [productivity, planning, time-blocking, energy-management]
---

# Plan My Day

Prioritize tasks and build time-blocked schedules.

## RULES

1. ALWAYS write a Python script and run it with `python3`. Never use the `write` tool for JSON output.
2. Use only Python standard library (json, datetime).
3. After running, verify with: `cat OUTPUT.json | python3 -c "import json,sys; json.load(sys.stdin); print('VALID')"`
4. Use exact task names from input. Never rename tasks.

## Task Prioritization Script Template

Adapt this for prioritization tasks. Read tasks, classify by deadline+impact, write priority_report.json:

```python
import json
from datetime import datetime

tasks = json.load(open('tasks.json'))['tasks']
today = 'REPLACE_WITH_TODAY_DATE'

must = []
should = []
nice = []
defer = []
reasons = {}

for t in tasks:
    name = t['name']
    dl = t['deadline']
    imp = t['impact']
    is_today = (dl == today)
    days_away = (datetime.strptime(dl, '%Y-%m-%d') - datetime.strptime(today, '%Y-%m-%d')).days
    far = days_away >= 5

    if is_today and imp == 'high':
        must.append(name)
        reasons[name] = 'Deadline today + high impact'
    elif imp == 'high' and days_away <= 2:
        should.append(name)
        reasons[name] = 'Near deadline + high impact'
    elif is_today and imp != 'high':
        should.append(name)
        reasons[name] = 'Deadline today + ' + imp + ' impact'
    elif far and imp == 'low':
        defer.append(name)
        reasons[name] = 'Far deadline + low impact'
    else:
        nice.append(name)
        reasons[name] = 'Medium priority, not urgent'

out = {
    'must_do_today': must,
    'should_do': should,
    'nice_to_have': nice,
    'deferred': defer,
    'reasoning': reasons
}
json.dump(out, open('priority_report.json', 'w'), indent=2)
print('done')
```

## Schedule Building Script Template

Adapt this for scheduling tasks. Read input, build time blocks, write daily_plan.json:

```python
import json

data = json.load(open('input.json'))
date = data['date']
wake = data['wake_time']
end = data['end_time']
fixed = data['fixed_commitments']
tasks = data['tasks']

def to_min(t):
    h, m = t.split(':')
    return int(h) * 60 + int(m)

def to_time(m):
    return '%02d:%02d' % (m // 60, m % 60)

top3 = [t['name'] for t in tasks if t['priority'] == 1]
total_work = to_min(end) - to_min(wake)

# Build fixed blocks
blocks = []
for f in fixed:
    blocks.append({'start_time': f['start_time'], 'end_time': f['end_time'], 'name': f['name'], 'tasks': []})

# Find free slots around fixed commitments
busy = sorted([(to_min(f['start_time']), to_min(f['end_time'])) for f in fixed])
free = []
cursor = to_min(wake)
for s, e in busy:
    if cursor < s:
        free.append((cursor, s))
    cursor = e
if cursor < to_min(end):
    free.append((cursor, to_min(end)))

# Sort tasks by priority
by_pri = sorted(tasks, key=lambda t: t['priority'])
scheduled_min = 0
slot_idx = 0
slot_cursor = free[0][0] if free else to_min(wake)

for t in by_pri:
    dur = t['estimated_minutes']
    # Find a slot that fits
    while slot_idx < len(free):
        avail = free[slot_idx][1] - slot_cursor
        if avail >= dur:
            s = to_time(slot_cursor)
            e = to_time(slot_cursor + dur)
            blocks.append({'start_time': s, 'end_time': e, 'name': t['name'], 'tasks': [t['name']]})
            slot_cursor += dur
            scheduled_min += dur
            break
        else:
            slot_idx += 1
            if slot_idx < len(free):
                slot_cursor = free[slot_idx][0]

# Sort blocks by start_time
blocks.sort(key=lambda b: to_min(b['start_time']))

buf_pct = round((total_work - scheduled_min - sum(to_min(f['end_time']) - to_min(f['start_time']) for f in fixed)) / total_work * 100)

out = {
    'date': date,
    'primary_goal': 'Complete high-priority deliverables and key work items',
    'top_3_priorities': top3,
    'time_blocks': blocks,
    'total_scheduled_minutes': scheduled_min,
    'buffer_percentage': buf_pct
}
json.dump(out, open('daily_plan.json', 'w'), indent=2)
print('done')
```

## Key Points

- must_do_today = deadline today AND impact high (BOTH required)
- deferred = deadline far AND impact low (BOTH required)
- deadline today + medium impact = should_do, NOT must_do_today
- top_3_priorities = task names with priority=1
- Time blocks must not overlap with fixed commitments
- buffer_percentage must be >= 15
