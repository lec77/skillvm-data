# skillvm-data

Benchmark dataset for the SkillVM paper's evaluation: the skills, tasks, and fixtures every experiment reads.

## Contents

- **`skills/`** — 40 skills. One directory per skill: `SKILL.md` plus optional `scripts/` and `references/` bundles. These are the unoptimized originals, and they are what the `original` arm of every experiment runs.

- **`tasks/`** — 112 task directories: **73 benchmark tasks** plus **39 content variants**.

  Each task has a `task.json` (id, prompt, category, eval criteria, and a `skill` binding pointing at `../../skills/<name>`) and a `fixtures/` directory whose files are copied into the agent's working directory before a run. An optional `fixtures/_setup.sh` runs after the copy — the git tasks use it to build repo history, and the document tasks to generate PDF/DOCX/PPTX inputs in a venv.

  Grading is automated: 111 tasks carry a bun test file scored by the `junit-grade` evaluator, which matches each criterion's regex against the test's `classname > name` and weights the results; 3 tasks use a `grade.py` that inspects the run transcript directly.

  The **content variants** are named `<task>-r1`, `-r2`, `-r3`. They are the same task type with different data — same schema, same size, the same number and kind of edge cases, and a `task.json` whose eval block is byte-identical to the original's. The staged-optimization experiment trains each of its rounds on a different variant and evaluates on the original, so a measured gain is over content the optimizer never saw.

- **`skill-variants/`** — pre-generated optimized skills, used as comparison arms:
  - `optimized/<skill>/` — one per skill, model-agnostic.
  - `targeted/<harness>/<model>/<skill>/` — one per (harness, model) pair.

- **`experiments/e5-solidify/`** — case specs and PDF fixtures for the code-solidification experiment: the invocation sequences (`weather-current`, `weather-forecast`, `pdf-extract`, `pdf-merge`) and the inputs they run against.

## Usage

Point SkillVM at this directory — either per command or through the environment:

```bash
bun run skvm bench --model=<provider/model> --skvm-data-dir=/path/to/skillvm-data ...

# or, once:
export SKVM_DATA_DIR=/path/to/skillvm-data
```

For the artifact's Docker image the dataset is baked in at `/opt/skillvm-ae/skillvm-data` and `SKVM_DATA_DIR` already points at it, so nothing needs to be set.
