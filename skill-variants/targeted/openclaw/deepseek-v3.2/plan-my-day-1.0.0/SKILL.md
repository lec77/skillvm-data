---
name: plan-my-day
version: 1.0.0
description: "Day planning: task prioritization by urgency/impact and energy-optimized time-blocked scheduling."
author: openclaw
---

# Plan My Day

Prioritize tasks and build time-blocked schedules. Output valid JSON files.

## Task Prioritization

When asked to categorize/prioritize tasks, use this decision tree on EACH task:

1. **must_do_today** — deadline is TODAY AND impact is "high"
2. **deferred** — deadline is far away (>3 days from today) AND impact is "low"
3. **should_do** — high impact with near deadline (tomorrow), OR high impact with distant deadline, OR medium/high effort tasks due tomorrow
4. **nice_to_have** — everything else (medium impact distant, low effort soon, etc.)

EVERY task must appear in EXACTLY ONE of the four arrays. No task left out. No task in two arrays.

### Priority Report JSON Format

Write `priority_report.json` with this EXACT structure:

```json
{
  "must_do_today": ["Task Name A", "Task Name B"],
  "should_do": ["Task Name C", "Task Name D"],
  "nice_to_have": ["Task Name E"],
  "deferred": ["Task Name F", "Task Name G"],
  "reasoning": {
    "Task Name A": "One-line explanation",
    "Task Name B": "One-line explanation",
    "Task Name C": "One-line explanation",
    "Task Name D": "One-line explanation",
    "Task Name E": "One-line explanation",
    "Task Name F": "One-line explanation",
    "Task Name G": "One-line explanation"
  }
}
```

IMPORTANT: The `reasoning` object must have an entry for EVERY task (all 12 if there are 12 tasks). Use the EXACT task name as the key. Each value is a non-empty string explaining the categorization.

### Categorization Example

Given today = 2026-03-16:
- "Submit tax forms" (deadline: 2026-03-16, impact: high) → **must_do_today** (due today + high impact)
- "Organize garage" (deadline: 2026-03-22, impact: low) → **deferred** (far deadline + low impact)
- "Review team proposals" (deadline: 2026-03-17, impact: high) → **should_do** (high impact, due tomorrow)
- "Morning jog routine" (deadline: 2026-03-16, impact: medium) → **nice_to_have** (due today but not high impact)

## Time-Blocked Scheduling

When asked to create a daily schedule from tasks with priorities and time estimates:

### Step 1: Identify Top 3 Priorities
Find the 3 tasks with `priority: 1`. These are your `top_3_priorities`.

### Step 2: Place Fixed Commitments
Add each fixed commitment as its own time block. These are immovable.

### Step 3: Schedule Tasks Around Commitments
- Place priority 1 tasks in morning slots (peak energy)
- Place priority 2 tasks in mid-day slots
- Place priority 3 tasks in late afternoon slots
- Blocks must NOT overlap — each block's start_time >= previous block's end_time

### Step 4: Calculate Buffer
- Available minutes = total minutes between wake_time and end_time, minus fixed commitment minutes
- Scheduled minutes = sum of all task estimated_minutes (NOT including fixed commitments)
- buffer_percentage = ((available_minutes - scheduled_minutes) / available_minutes) * 100
- Buffer must be at least 15%

### Daily Plan JSON Format

Write `daily_plan.json` with this EXACT structure:

```json
{
  "date": "2026-03-20",
  "primary_goal": "One sentence describing the day's main focus",
  "top_3_priorities": ["Task A", "Task B", "Task C"],
  "time_blocks": [
    {
      "start_time": "07:00",
      "end_time": "08:30",
      "name": "Deep Work Block",
      "tasks": ["Task A"]
    },
    {
      "start_time": "10:00",
      "end_time": "10:30",
      "name": "Team standup",
      "tasks": []
    }
  ],
  "total_scheduled_minutes": 370,
  "buffer_percentage": 20.5
}
```

IMPORTANT rules for time_blocks:
- Each block has: `start_time` (HH:MM), `end_time` (HH:MM), `name` (string), `tasks` (array of strings)
- Fixed commitments get their own blocks with `tasks: []` (empty array) or with the commitment name
- The `name` field for fixed commitment blocks MUST contain the commitment name (e.g., "Team standup", "Design review meeting", "1:1 with manager")
- ALL tasks from the input must appear in at least one time block's `tasks` array
- Blocks must be sorted by start_time and must NOT overlap
- `total_scheduled_minutes` is a number (sum of task work minutes, excluding fixed commitments)
- `buffer_percentage` is a number >= 15
- Use exact task names from the input JSON

## Common Mistakes to Avoid

1. Forgetting tasks — every single task must be categorized or scheduled
2. Wrong JSON field names — use the exact names shown above
3. Overlapping time blocks — check that each block starts after the previous ends
4. Missing reasoning entries — every task needs a reasoning string
5. Putting numbers as strings — `total_scheduled_minutes` and `buffer_percentage` must be numbers, not "370"
6. Forgetting fixed commitments as blocks — meetings must appear as their own time blocks
