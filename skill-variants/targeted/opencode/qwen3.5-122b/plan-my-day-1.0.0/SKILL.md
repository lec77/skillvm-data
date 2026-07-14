---
name: plan-my-day
description: Generate an energy-optimized, time-blocked daily plan
version: 1.0.0
---

# Plan My Day

Generate structured daily plans as JSON. Read input files, apply prioritization logic, and write output JSON files.

## Task Types

### Task Prioritization

When given tasks with deadline, effort, impact, and category fields:

1. Read the input JSON file completely
2. Compare each task's deadline against today's date
3. Categorize into exactly 4 arrays:
   - `must_do_today`: deadline is TODAY **and** impact is "high"
   - `should_do`: important tasks not critically urgent today (e.g., high impact but deadline is not today, or deadline is tomorrow with medium+ impact)
   - `nice_to_have`: medium-impact tasks that are not urgent (never put impact="low" tasks here)
   - `deferred`: ALL tasks where impact is "low" and deadline is not today go here — this is the only correct bucket for low-impact non-today tasks
4. Classification decision tree:
   - If deadline=today AND impact="high" → `must_do_today`
   - If impact="low" AND deadline≠today → `deferred`
   - If impact="high" or deadline is soon → `should_do`
   - Otherwise → `nice_to_have`
5. Every task must appear in exactly one array — no duplicates, no omissions
5. Provide reasoning for every task

**Output format** — write a JSON file:
```json
{
  "must_do_today": ["task name 1", "task name 2"],
  "should_do": ["task name 3"],
  "nice_to_have": ["task name 4"],
  "deferred": ["task name 5"],
  "reasoning": {
    "task name 1": "Deadline is today and high impact — must complete",
    "task name 2": "...",
    "task name 3": "...",
    "task name 4": "...",
    "task name 5": "..."
  }
}
```

Use exact task names from the input. The reasoning object must have one key per task (all tasks).

### Workday Scheduling

When given a date, wake/end times, fixed commitments, and tasks with priorities and time estimates:

1. Read the input JSON file completely
2. Identify the 3 tasks with priority=1 as top priorities
3. Create time blocks that:
   - Include all fixed commitments as their own blocks
   - Schedule all tasks into non-overlapping blocks
   - Place high-priority tasks in morning/peak hours
   - Leave at least 15-20% buffer time (do NOT schedule 100% of available time)
4. Calculate total_scheduled_minutes (task work only, excluding fixed commitments)
5. Calculate buffer_percentage = (available_work_minutes - total_scheduled_minutes) / available_work_minutes * 100

**Output format** — write a JSON file:
```json
{
  "date": "YYYY-MM-DD",
  "primary_goal": "One-sentence description of the day's main focus",
  "top_3_priorities": ["task1", "task2", "task3"],
  "time_blocks": [
    {
      "start_time": "07:00",
      "end_time": "08:30",
      "name": "Deep Work Block",
      "tasks": ["task name here"]
    },
    {
      "start_time": "10:00",
      "end_time": "10:30",
      "name": "Team standup",
      "tasks": []
    }
  ],
  "total_scheduled_minutes": 370,
  "buffer_percentage": 31.5
}
```

Rules for time_blocks:
- Use HH:MM format for start_time and end_time
- No two blocks may overlap
- Fixed commitments must appear as blocks (use their original names)
- All tasks from input must appear in at least one block's tasks array
- top_3_priorities contains the names of the 3 tasks with priority=1

## Key Rules

- Always read the input file first before generating output
- Write valid JSON to the output file (not markdown, not wrapped in code blocks)
- Use exact task names from the input — do not rephrase or abbreviate
- Include ALL tasks — verify count matches input
- Double-check date comparisons and arithmetic
