---
name: plan-my-day
description: Generate an energy-optimized, time-blocked daily plan with task prioritization. Use this skill whenever someone asks to plan their day, schedule tasks, prioritize a to-do list, create a daily schedule, organize their workday, or do time-blocking — even if they don't say "plan my day" explicitly.
version: 1.0.0
author: theflohart
tags: [productivity, planning, time-blocking, energy-management]
---

# Plan My Day

Generate a clean, actionable daily plan by classifying tasks by urgency/impact, then scheduling them into energy-matched time blocks.

## Step 1: Classify Tasks by Urgency and Impact

Sort every task into exactly one bucket using this decision tree:

1. **must_do_today** — deadline is today AND impact is high. These are non-negotiable.
2. **deferred** — deadline is far out (>3 days) AND impact is low. These can wait.
3. **should_do** — everything with high impact OR a near deadline (tomorrow) that didn't land in must_do_today. Also includes today-deadline tasks with medium impact.
4. **nice_to_have** — whatever remains: medium impact with distant deadlines, or low-effort low-impact tasks due soon.

Every task goes in exactly one bucket. No task is left uncategorized. Provide a one-line reason for each placement.

## Step 2: Identify Top 3 Priorities

From the must_do_today and should_do buckets, pick the 3 tasks that move the needle most. If explicit priority levels are provided (priority=1, 2, 3), use those — priority 1 tasks are your top 3.

## Step 3: Build the Time-Blocked Schedule

### Energy Windows

Schedule tasks to match cognitive demand to energy levels:

| Window | Time | Best for |
|--------|------|----------|
| Peak | First 2-3 hours after start | Hardest task first. Deep, creative, analytical work. |
| Secondary | Mid-morning after first break | Focused work, collaborative tasks |
| Post-lunch dip | Early afternoon | Meetings, lighter reviews, admin |
| Recovery | Late afternoon | Low-effort tasks, email, reading, organizing |

### Scheduling Rules

1. **Fixed commitments first.** Lock in meetings and appointments as immovable blocks.
2. **Hardest P1 task gets the first available peak slot.** The single most demanding task goes here — uninterrupted.
3. **Batch similar tasks.** Group communications together, group admin tasks together. Batching reduces context-switching overhead.
4. **No block longer than 90 minutes** without a break or transition.
5. **Buffer time is mandatory.** Leave at least 15-20% of available work time unscheduled. This absorbs overruns and surprises. Calculate it: `buffer% = (available_minutes - scheduled_minutes) / available_minutes * 100`.
6. **Breaks are blocks too.** Include lunch, short breaks between intense blocks. Don't just hope they happen.
7. **Wind-down slot.** Reserve the last 30-45 minutes for low-stakes tasks (organizing, reading, light admin). This prevents decision fatigue from spilling into personal time.

### Constructing Time Blocks

Each block needs:
- `start_time` and `end_time` in HH:MM format
- `name` — a descriptive label for the block
- `tasks` — array of task names assigned to this block (empty array for fixed commitments)

Sort blocks chronologically. Blocks must not overlap — each block's start_time must be >= the previous block's end_time.

## Output Formats

### For prioritization tasks

```json
{
  "must_do_today": ["task names..."],
  "should_do": ["task names..."],
  "nice_to_have": ["task names..."],
  "deferred": ["task names..."],
  "reasoning": {
    "Task Name": "One-line explanation of why this task is in its bucket"
  }
}
```

### For scheduling tasks

```json
{
  "date": "YYYY-MM-DD",
  "primary_goal": "One sentence describing the day's main focus",
  "top_3_priorities": ["task 1", "task 2", "task 3"],
  "time_blocks": [
    {
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "name": "Block Label",
      "tasks": ["task names in this block"]
    }
  ],
  "total_scheduled_minutes": 370,
  "buffer_percentage": 20.5
}
```

## Common Mistakes to Avoid

- Scheduling 100% of available time (always leave buffer)
- Putting hard tasks after lunch when energy dips
- Forgetting to include fixed commitments as their own blocks
- Leaving tasks out of the schedule
- Overlapping time blocks
