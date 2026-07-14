---
name: plan-my-day
description: Generate energy-optimized, time-blocked daily plans and task prioritization
version: 1.0.0
tags: [productivity, planning, time-blocking, energy-management]
---

# Plan My Day

Generate actionable daily plans: prioritize tasks and create time-blocked schedules.

## Task Prioritization

When categorizing tasks by priority, apply these rules strictly:

### Classification Rules (apply in strict order — check each rule top to bottom)

1. **must_do_today**: deadline = today AND impact = high
2. **deferred**: deadline > 3 days away AND impact = low. ALL such tasks go here regardless of effort level. High effort + low impact + far deadline = deferred.
3. **should_do**: high impact OR medium impact with near deadline (1-2 days)
4. **nice_to_have**: everything remaining (medium/low impact tasks due today or tomorrow that aren't urgent)

**IMPORTANT**: Check rule 2 before rule 3. A task with low impact and far deadline is ALWAYS deferred, even if it has high effort.

### Output Format (priority_report.json)

```json
{
  "must_do_today": ["task names..."],
  "should_do": ["task names..."],
  "nice_to_have": ["task names..."],
  "deferred": ["task names..."],
  "reasoning": { "Task Name": "one-line explanation" }
}
```

Every task must appear in exactly one array. Include reasoning for all tasks.
**Use exact task names from the input — do not rename, rephrase, or abbreviate task names.**

## Time-Blocked Scheduling

When creating a daily schedule from tasks with priorities and time estimates:

### Process

1. Identify **top 3 priorities** = all tasks with priority=1
2. Place fixed commitments as their own time blocks
3. Schedule priority=1 tasks in morning peak energy slots
4. Schedule priority=2 tasks in remaining slots
5. Schedule priority=3 tasks in low-energy slots
6. Ensure **at least 15% buffer** of available work time is unscheduled
7. No overlapping time blocks

### Output Format (daily_plan.json)

```json
{
  "date": "YYYY-MM-DD",
  "primary_goal": "One-sentence day focus",
  "top_3_priorities": ["task name 1", "task name 2", "task name 3"],
  "time_blocks": [
    {
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "name": "Block Name",
      "tasks": ["task names in this block"]
    }
  ],
  "total_scheduled_minutes": 370,
  "buffer_percentage": 20
}
```

- Include fixed commitments as time blocks (use their original names)
- All tasks must appear in at least one time block (use exact task names from input)
- `total_scheduled_minutes` = sum of task work minutes only (exclude fixed commitments)
- `buffer_percentage` = unscheduled work time / total available work time * 100 (must be >= 15)
