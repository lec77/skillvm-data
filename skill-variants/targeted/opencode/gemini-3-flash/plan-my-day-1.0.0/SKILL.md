---
name: plan-my-day
description: Generate daily plans, schedules, and task prioritization reports as JSON — use for any task involving scheduling, time-blocking, or categorizing/prioritizing tasks
version: 1.0.0
tags: [productivity, planning, time-blocking, prioritization]
---

# Plan My Day

You produce structured JSON daily plans. Read the input file, apply the rules below, and write the output JSON file to the current working directory.

## Task Type A: Schedule a Workday

**When to use**: The prompt mentions `input.json`, scheduling, time-blocking, or creating a daily plan.

**Steps**:
1. Read `input.json` from the current directory
2. Apply the rules below
3. Write `daily_plan.json` to the current directory

**Output schema** — `daily_plan.json`:

```json
{
  "date": "YYYY-MM-DD",
  "primary_goal": "One sentence describing the day's main focus",
  "top_3_priorities": ["exact task name 1", "exact task name 2", "exact task name 3"],
  "time_blocks": [
    {
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "name": "Block Name",
      "tasks": ["Exact Task Name"]
    }
  ],
  "total_scheduled_minutes": 370,
  "buffer_percentage": 20
}
```

**Rules**:
1. `date`: copy the date string from input.json exactly
2. `top_3_priorities`: array of exactly the 3 task names where `priority` equals 1. Copy names exactly from input.json — do not rephrase
3. `time_blocks`: non-overlapping blocks between wake_time and end_time, sorted chronologically
4. Each fixed commitment becomes its own time block. Use the commitment's name as the block `name`. The `tasks` array for commitment blocks can be empty or contain the commitment name
5. All 8 tasks from input must appear in exactly one block's `tasks` array. Use the **exact** task name strings from input.json — character-for-character identical
6. Schedule priority=1 tasks in morning blocks (peak energy), priority=3 tasks in afternoon blocks
7. `total_scheduled_minutes`: sum of `estimated_minutes` for all 8 tasks only (do NOT include fixed commitment durations)
8. `buffer_percentage`: percentage of available work time left unscheduled. Must be >= 15. Formula: `((available_minutes - total_scheduled_minutes) / available_minutes) * 100` where available_minutes = total minutes from wake_time to end_time minus fixed commitment minutes
9. Blocks must not overlap: each block's start_time must be >= the previous block's end_time

## Task Type B: Prioritize Tasks

**When to use**: The prompt mentions `tasks.json`, prioritizing, categorizing tasks, or urgency/impact.

**Steps**:
1. Read `tasks.json` from the current directory
2. Note the "today" date from the prompt
3. Apply the classification rules below
4. Write `priority_report.json` to the current directory

**Output schema** — `priority_report.json`:

```json
{
  "must_do_today": ["exact task name", ...],
  "should_do": ["exact task name", ...],
  "nice_to_have": ["exact task name", ...],
  "deferred": ["exact task name", ...],
  "reasoning": {
    "Exact Task Name": "One-line explanation"
  }
}
```

**Classification rules** (apply in this order):
1. `must_do_today`: deadline equals today's date AND impact is "high"
2. `deferred`: deadline is 6+ days after today AND impact is "low" — these always go here regardless of effort
3. `should_do`: high impact with upcoming deadline (1-2 days), OR medium impact due tomorrow, OR high impact due in 3-5 days
4. `nice_to_have`: everything remaining that doesn't fit above categories
5. Every task must appear in exactly one of the four arrays. The total count across all 4 arrays must equal the number of tasks in the input
6. `reasoning`: one entry per task. Key must be the **exact** task name from tasks.json. Value is a brief explanation string

## Critical Requirements

- **Read the input file first**: You MUST use the read tool to read the input file. Do NOT guess or assume its contents
- **Exact names**: After reading, copy task names and commitment names character-for-character from the file you just read. Never rename, abbreviate, or rephrase them
- **Valid JSON**: No comments, no trailing commas, no markdown code fences — pure JSON only
- **Write the output file**: You MUST use the write tool to create the output file in the current working directory. Do not just print the JSON — you must write it to a file
- **All tasks accounted for**: Every task in the input must appear in the output. Count them before writing to verify
