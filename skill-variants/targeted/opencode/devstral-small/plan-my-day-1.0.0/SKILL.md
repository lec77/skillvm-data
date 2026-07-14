---
name: plan-my-day
description: Generate structured daily plans as JSON
version: 1.0.0
---

# Plan My Day

Create structured daily plans from task/schedule input data. Always output valid JSON files.

## Task Type 1: Schedule a Workday

When given input with `wake_time`, `end_time`, `fixed_commitments`, and `tasks` array:

1. Read input.json
2. Write `daily_plan.json` with this exact structure:

```json
{
  "date": "<date from input>",
  "primary_goal": "<one sentence describing the day's main focus>",
  "top_3_priorities": ["<task1>", "<task2>", "<task3>"],
  "time_blocks": [
    {
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "name": "<block label>",
      "tasks": ["<task name>", ...]
    }
  ],
  "total_scheduled_minutes": <number>,
  "buffer_percentage": <number>
}
```

Rules:
- `top_3_priorities`: exactly 3 task names where priority=1 in input. Use exact task name strings from input.
- `time_blocks`: every block needs start_time, end_time, name, tasks fields. Blocks must NOT overlap. Include fixed commitments as their own blocks (use commitment name as block name). Schedule ALL tasks from input into blocks.
- `total_scheduled_minutes`: sum of task estimated_minutes only (exclude fixed commitments)
- `buffer_percentage`: percentage of available work time left unscheduled. Must be >= 15.
- Available work time = total minutes from wake_time to end_time minus fixed commitment minutes.
- Schedule priority=1 tasks in morning peak hours, priority=3 tasks later.

## Task Type 2: Prioritize Tasks

When given input with a `tasks` array containing deadline, effort, impact fields:

1. Read the input JSON file
2. Write `priority_report.json` with this exact structure:

```json
{
  "must_do_today": ["<task name>", ...],
  "should_do": ["<task name>", ...],
  "nice_to_have": ["<task name>", ...],
  "deferred": ["<task name>", ...],
  "reasoning": {
    "<task name>": "<one-line explanation>",
    ...
  }
}
```

Rules:
- `must_do_today`: tasks with deadline=today AND impact=high
- `deferred`: tasks with deadline far in the future (>5 days) AND impact=low
- `should_do`: important tasks not in must_do_today (e.g., deadline tomorrow with high impact, or deadline today with medium impact)
- `nice_to_have`: remaining lower-priority tasks
- Every task must appear in exactly one array. Use exact task name strings.
- `reasoning`: object with a key for every task name, value is a non-empty string explanation.
- All task names must match the input exactly (case-sensitive).

## Critical Rules

1. Always read the input JSON file first
2. Output must be valid JSON written to a file (not printed to stdout)
3. Use exact field names shown above
4. Use exact task name strings from input — do not rephrase
5. Every task from input must appear in the output
