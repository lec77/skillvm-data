# Optimization Notebook — `d3-visualization` (bare/qwen3-30b)

## Baseline — 2026-03-31

**AOT score** (`interactive-area`): 53.3/100

---

## Round 1 — 2026-03-31 | JIT on `line-chart`

**JIT task score**: 100/100
**Grader summary**: AOT score was 53.3 despite 100 on training task, indicating the skill lacked coverage for chart types beyond line charts (likely area charts) and interactivity patterns. Added area chart, scatter plot, tooltip, crosshair, and brush sections.
**Failed criteria**: interactive-area

**Planned changes**:
- Added area chart template with d3.area() and proper placeholders
- Added scatter plot template
- Added interactivity patterns: tooltip, vertical crosshair, brush selection
- Added multi-series guidance
- Added general adaptation checklist for unknown task types

**Skill size**: 1582 → 7025 chars

**Test task result** (`interactive-area`): 53.3/100 (prev: 53.3/100, +0.0)

---

## Round 2 — 2026-03-31 | JIT on `area-chart`

**JIT task score**: 100/100
**Grader summary**: Round 1 added area chart and interactivity as separate disconnected sections but test score didn't improve (53.3). Replaced with a single complete integrated interactive area chart template that combines area rendering, crosshair, tooltip, and mouse overlay in one copy-paste-ready HTML file — addressing the capability gap where the small model couldn't assemble separate patterns.
**Failed criteria**: interactive-area

**Planned changes**:
- Replaced disconnected area chart + interactivity sections with ONE complete integrated interactive area chart HTML template
- Added transparent overlay rect for mouse events (critical for line/area interactivity)
- Added crosshair vertical line + focus circle + tooltip all wired together in the template
- Added bisector-based nearest-point snapping in mousemove handler
- Added axis label text elements in the template
- Made interactivity detection explicit: if task says 'interactive' or mentions hover/tooltip, MUST use interactive template
- Removed training-task-specific content (training prompt, eval criteria, transcript)

**Skill size**: 7025 → 8768 chars

**Test task result** (`interactive-area`): 26.7/100 (prev: 53.3/100, -26.6)

---

## Round 3 — 2026-03-31 | JIT on `brush-chart`

**JIT task score**: 68/100
**Grader summary**: Round 2's large integrated template caused a regression (53.3→26.7). Reverted to concise skill with static SVG rule strengthened (explicit WRONG/RIGHT examples), added brief brush and tooltip snippets as composable patterns rather than monolithic templates, and kept total size small to prevent output truncation.
**Failed criteria**: chart-structure, brush-api

**Planned changes**:
- Reverted from monolithic integrated template that caused Round 2 regression
- Added explicit WRONG/RIGHT examples for static SVG rule to prevent JS-generated elements
- Added composable brush snippet with d3.brushX() and brush.on('end') pattern
- Added composable tooltip/crosshair snippet
- Added area chart as minimal delta from line chart instead of separate full template
- Added adaptation checklist emphasizing complete file output to prevent truncation

**Skill size**: 1582 → 4990 chars

**Test task result** (`interactive-area`): 50/100 (prev: 26.7/100, +23.3)
