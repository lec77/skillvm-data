---
name: plan-my-day
description: Generate structured daily plans and priority reports as JSON files
version: 1.0.0
tags: [productivity, planning, time-blocking, prioritization]
---

# Plan My Day

Generate structured daily plans from input data. Always read the input file first, then write a JSON output file.

## Task: Schedule a Workday

When given `input.json` with date, wake/end times, fixed commitments, and tasks:

**Output: `daily_plan.json`** with these exact fields:
- `date`: string — copy from input (e.g. "2026-03-20")
- `primary_goal`: string — one sentence describing the day's main focus
- `top_3_priorities`: array of 3 strings — names of tasks where priority=1
- `time_blocks`: array of objects, each with:
  - `start_time`: "HH:MM" format
  - `end_time`: "HH:MM" format
  - `name`: string — block label (for fixed commitments, use their name e.g. "Team standup")
  - `tasks`: array of task name strings scheduled in this block (empty array for fixed commitment blocks)
- `total_scheduled_minutes`: number — sum of estimated_minutes for all 8 tasks
- `buffer_percentage`: number — percentage of available work time left unscheduled, must be >= 15

**Rules:**
1. Include ALL fixed commitments as their own time blocks with their exact times
2. Schedule ALL tasks from the input into non-overlapping blocks
3. Priority 1 tasks go in morning peak energy (before noon when possible)
4. Time blocks must not overlap with each other or with fixed commitments
5. Leave at least 15% buffer in the schedule
6. Task names in top_3_priorities and time_blocks.tasks must match input exactly

## Task: Prioritize Tasks

When given `tasks.json` with tasks having name, deadline, effort, impact, and category:

**Output: `priority_report.json`** with these exact fields:
- `must_do_today`: array of task name strings — tasks with deadline = today AND impact = "high"
- `should_do`: array of task name strings — important but not critically urgent today
- `nice_to_have`: array of task name strings — lower priority tasks
- `deferred`: array of task name strings — tasks with deadline far in future AND impact = "low"
- `reasoning`: object mapping each task name to a one-line explanation string

**Rules:**
1. Every task must appear in exactly one of the four arrays
2. Total count across all arrays must equal total number of input tasks
3. Task names must match the input exactly (case-sensitive)
4. The reasoning object must have an entry for every single task
5. Classification logic:
   - `must_do_today`: deadline is today AND impact is "high"
   - `deferred`: deadline is far future (>3 days away) AND impact is "low"
   - `should_do`: high impact or near deadline but not must_do_today
   - `nice_to_have`: everything else

## Output Requirements

- Always write valid JSON files
- Use exact field names as specified above
- Task names must be copied exactly from input — do not rephrase or abbreviate
- Write the output file to the current working directory
