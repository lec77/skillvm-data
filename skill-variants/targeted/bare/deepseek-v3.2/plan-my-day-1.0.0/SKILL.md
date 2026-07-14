---
name: plan-my-day
description: Generate an energy-optimized, time-blocked daily plan
version: 1.0.0
---

# Plan My Day

Create actionable daily plans with time-blocking and energy-based scheduling.

## Core Principles

1. **Top 3 Focus** — Identify the 3 highest-priority outcomes
2. **Energy Scheduling** — Hard tasks in peak energy windows (morning), lighter tasks later
3. **Time Blocking** — Assign specific time windows; include buffer (≥15-20%)
4. **Fixed Commitments First** — Schedule around meetings/appointments

## Process

1. **Gather Context** — Read input for date, tasks, commitments, constraints
2. **Identify Priorities** — Rank by priority level, deadline urgency, and impact
3. **Build Schedule** — Assign priority tasks to peak windows, block fixed commitments, add buffers
4. **Validate** — No overlapping blocks, all tasks included, buffer ≥ 15%

## Task Prioritization

Categorize tasks by urgency (deadline) and impact:
- **Must-do-today**: deadline=today AND high impact
- **Should-do**: important but not immediately critical
- **Nice-to-have**: lower priority
- **Deferred**: distant deadline AND low impact

Provide reasoning for each categorization decision.

## Output

Produce structured JSON output. Always include all tasks from input. Ensure time blocks don't overlap and respect fixed commitments.
