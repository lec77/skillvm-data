---
name: plan-my-day
description: Daily planning and task prioritization as JSON
version: 1.0.0
tags: [productivity, planning]
---

# Plan My Day

Helper scripts are provided in the working directory for generating JSON output files.

## When asked to produce daily_plan.json from input.json

Run: `python3 generate_schedule.py`

This reads input.json and writes daily_plan.json with date, primary_goal, top_3_priorities, time_blocks, total_scheduled_minutes, and buffer_percentage.

## When asked to produce priority_report.json from tasks.json

Run: `python3 generate_priorities.py`

This reads tasks.json and writes priority_report.json with must_do_today, should_do, nice_to_have, deferred, and reasoning.
