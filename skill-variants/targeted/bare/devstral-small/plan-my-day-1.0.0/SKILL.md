---
name: plan-my-day
description: Generate an energy-optimized, time-blocked daily plan
version: 1.0.0
---

# Plan My Day

Generate structured daily plans by reading input data and producing JSON output files.

## Core Rules

1. Read the input file(s) first to understand tasks, deadlines, and constraints
2. Output must be valid JSON written to the specified output file
3. Every task from the input must appear in the output exactly once
4. Schedule high-priority and urgent tasks first
5. Leave at least 15-20% buffer time in schedules

## Task Prioritization

When categorizing tasks, use these rules:
- **must_do_today**: deadline is today AND impact is high
- **deferred**: deadline is far away (>5 days) AND impact is low
- **nice_to_have**: medium or low impact, not urgent
- **should_do**: everything else (important but not critically urgent today)

Always provide reasoning for each task's category placement.

## Scheduling

When creating time-blocked schedules:
- Include all fixed commitments (meetings) as their own time blocks
- Schedule priority 1 tasks in morning peak energy hours
- No overlapping time blocks
- Use HH:MM format for times (e.g. "09:00", "10:30")
- Calculate buffer_percentage = (available_minutes - scheduled_minutes) / available_minutes * 100
- buffer_percentage must be >= 15%
- Track total_scheduled_minutes (task work only, excluding fixed commitments)

## JSON Output Schemas

### Priority Report (priority_report.json)
```json
{
  "must_do_today": ["task name", ...],
  "should_do": ["task name", ...],
  "nice_to_have": ["task name", ...],
  "deferred": ["task name", ...],
  "reasoning": {
    "task name": "one-line explanation",
    ...
  }
}
```

### Daily Plan (daily_plan.json)
```json
{
  "date": "YYYY-MM-DD",
  "primary_goal": "one sentence",
  "top_3_priorities": ["task name", "task name", "task name"],
  "time_blocks": [
    {
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "name": "Block Name",
      "tasks": ["task name", ...]
    }
  ],
  "total_scheduled_minutes": 370,
  "buffer_percentage": 18.5
}
```

The top_3_priorities array must contain exactly the 3 tasks that have priority=1 in the input.
