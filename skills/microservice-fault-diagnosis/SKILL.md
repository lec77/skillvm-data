---
name: microservice-fault-diagnosis
description: Systematic approach to diagnosing and fixing faults across independent microservices
---

## When to Use

Activate this playbook when you encounter:
- Multiple services failing independently after a deployment or config change
- Cascading alerts across services that do not share a common dependency
- Post-deployment test failures in two or more microservices simultaneously
- Situations where each service's failures have distinct root causes (not a shared upstream outage)

## Diagnosis Methodology

### 1. Fault Isolation

Before diving into code, verify that the failing services are truly independent:
- No shared database or data store between them
- No direct API calls or RPC dependencies between the affected services
- No shared library version that was recently updated

If services share a dependency, fix the shared component first. If they are independent, each failure has its own root cause and can be diagnosed separately.

### 2. Evidence Collection

Always start by running the test suite to establish the failure pattern:

```
python3 -m pytest tests/ -v
```

Read the full output carefully. Note which tests fail, what the assertion errors say, and whether failures are consistent across runs. Flaky failures suggest concurrency or timing issues; deterministic failures suggest logic bugs.

### 3. Root Cause Analysis

Read source files systematically. Start from the failing test assertion and trace backward:
- What function does the test call?
- What does that function return or mutate?
- Where does the actual value diverge from the expected value?

Do not guess. Trace the code path from the test's failing assertion through every function call until you find the exact line where behavior diverges from the specification.

### 4. Minimal Fix Principle

Fix the root cause with the smallest possible change:
- Never rewrite or modify test files — tests define the correct behavior
- Never refactor unrelated code — stay focused on the bug
- Prefer fixing the logic error over adding workarounds
- If a function computes the wrong value, fix the computation — do not patch the caller

### 5. Verification

After applying a fix, re-run the full test suite:

```
python3 -m pytest tests/ -v
```

All tests must pass — not just the ones that were failing. A fix that breaks other tests is not a fix.

## Common Fault Patterns

These are the most frequent bugs encountered in microservice codebases:

- **Token/session management**: Expiry calculations off by one, tokens not refreshed before use, session state not cleared on logout, hardcoded secrets that differ from test expectations
- **Data type mismatches**: Timestamps stored as strings vs. datetime objects, timezone-naive vs. timezone-aware comparisons, integer vs. float division in Python 3, JSON serialization losing type information
- **Retry logic errors**: Missing error classification (retrying non-transient errors), no backoff causing tight loops, retry counters off by one, infinite retry when max_retries is zero

## Workflow

Work through each service methodically. Complete diagnosis and verification for one service before moving to the next. This prevents confusion from context-switching between codebases and ensures each fix is verified in isolation.

### Service 1: auth_service/

1. `cd auth_service && python3 -m pytest tests/ -v` — establish the failure pattern
2. Read all source files under `auth_service/` to understand the codebase
3. Trace from the failing assertion to the root cause
4. Apply a minimal fix to the source code (never modify tests)
5. Re-run `python3 -m pytest tests/ -v` — all tests must pass

### Service 2: data_pipeline/

1. `cd data_pipeline && python3 -m pytest tests/ -v` — establish the failure pattern
2. Read all source files under `data_pipeline/` to understand the codebase
3. Trace from the failing assertion to the root cause
4. Apply a minimal fix to the source code (never modify tests)
5. Re-run `python3 -m pytest tests/ -v` — all tests must pass

### Service 3: task_scheduler/

1. `cd task_scheduler && python3 -m pytest tests/ -v` — establish the failure pattern
2. Read all source files under `task_scheduler/` to understand the codebase
3. Trace from the failing assertion to the root cause
4. Apply a minimal fix to the source code (never modify tests)
5. Re-run `python3 -m pytest tests/ -v` — all tests must pass

## Post-Fix Checklist

- [ ] All three services pass their full test suites
- [ ] No test files were modified
- [ ] Each fix is minimal — only the root cause was changed
- [ ] No regressions introduced (tests that passed before still pass)
- [ ] Document what was found: which file, which line, what the bug was, and why the fix is correct
