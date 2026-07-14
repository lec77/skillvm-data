---
name: plan-my-day
description: Generate daily plans, schedules, and task prioritization reports as JSON — use for any task involving scheduling, time-blocking, or categorizing/prioritizing tasks
version: 1.0.0
tags: [productivity, planning, time-blocking, prioritization]
---

# Plan My Day

You produce structured JSON daily plans. Read the input file, apply the rules below, and write the output JSON file.

## Task Type: Schedule a Workday

**Input**: `input.json` with date, wake_time, end_time, fixed_commitments, and tasks (each with name, priority, estimated_minutes, category).

**Output**: `daily_plan.json` with this exact schema:

```json
{
  "date": "YYYY-MM-DD",
  "primary_goal": "One sentence describing the day's main focus",
  "top_3_priorities": ["task1", "task2", "task3"],
  "time_blocks": [
    {
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "name": "Block Name",
      "tasks": ["Task Name 1", "Task Name 2"]
    }
  ],
  "total_scheduled_minutes": 370,
  "buffer_percentage": 20
}
```

**Rules**:
1. `top_3_priorities`: include exactly the task names where `priority` = 1
2. `time_blocks`: non-overlapping blocks between wake_time and end_time
3. Each fixed commitment becomes its own block (use its name as block name, tasks array can be empty or contain the commitment name)
4. All tasks from input must appear in exactly one block's `tasks` array — use the **exact task name strings** from input
5. Schedule priority 1 tasks in morning blocks (peak energy), priority 3 tasks later
6. `total_scheduled_minutes`: sum of estimated_minutes for all 8 tasks only (exclude fixed commitments)
7. `buffer_percentage`: percentage of available work time (wake-to-end minus fixed commitments) left unscheduled. Must be ≥ 15

## Task Type: Prioritize Tasks

**Input**: `tasks.json` with an array of tasks, each having name, deadline, effort, impact, category. Today's date is given in the prompt.

**Output**: `priority_report.json` with this exact schema:

```json
{
  "must_do_today": ["task names..."],
  "should_do": ["task names..."],
  "nice_to_have": ["task names..."],
  "deferred": ["task names..."],
  "reasoning": {
    "Task Name": "One-line explanation of categorization"
  }
}
```

**Rules**:
1. `must_do_today`: tasks where deadline = today AND impact = "high"
2. `deferred`: ALL tasks where deadline is 6+ days away AND impact = "low" go here, regardless of effort level (high effort + low impact + far deadline = still deferred)
3. `should_do`: important tasks — high impact with upcoming deadline, or medium impact with near deadline
4. `nice_to_have`: all remaining tasks that don't fit the above categories
5. Every task must appear in exactly one array. Total count across all 4 arrays must equal total input tasks
6. `reasoning`: one entry per task using the **exact task name** as key, with a brief explanation string

## Critical Requirements

- Use **exact task/commitment names** from the input — do not rename or rephrase
- Output valid JSON only — no comments, no trailing commas
- Write the output file to the current working directory
