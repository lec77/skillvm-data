---
name: microservice-fault-diagnosis
description: Systematic approach to diagnosing and fixing faults across independent Python modules
---

## When to Use

Activate this playbook when you have multiple independent Python modules with
failing tests, where each failure has a distinct root cause. This is common
after a refactor touches multiple packages, after a batch of feature merges,
or when an automated CI run flags failures across unrelated components.

## Diagnosis Methodology

### 1. Evidence Collection

Always start by running the test suite to establish the failure pattern:

```bash
python3 -m pytest tests/ -v
```

Read the full output carefully. Note which tests fail, what the assertion errors
say, and whether failures are consistent. Deterministic failures indicate
logic bugs; trace them directly from the assertion.

### 2. Root Cause Analysis

Read source files systematically. Start from the failing test assertion and
trace backward through the call stack until you find the exact line where
behavior diverges from the specification. Do not guess.

### 3. Minimal Fix Principle

Fix the root cause with the smallest possible change. Never modify test files.
Never refactor unrelated code. If a function returns the wrong value, fix
the computation, not the caller.

### 4. Verification

After each fix, re-run the full test suite. All tests must pass, not just
the ones that were failing.

## Workflow

Work through each module methodically. Complete diagnosis and verification
for one module before moving to the next.

### Module 1: network_monitor/

1. `cd network_monitor && python3 -m pytest tests/ -v`
2. Read all source files under `network_monitor/`
3. Trace from failing assertions to the root cause
4. Apply a minimal fix (never modify tests)
5. Re-run — all tests must pass

### Module 2: cache_manager/

1. `cd cache_manager && python3 -m pytest tests/ -v`
2. Read all source files under `cache_manager/`
3. Trace and fix the root cause
4. Re-run — all tests must pass

### Module 3: report_generator/

1. `cd report_generator && python3 -m pytest tests/ -v`
2. Read all source files under `report_generator/`
3. Trace and fix the root cause
4. Re-run — all tests must pass

### Module 4: api_gateway/

1. `cd api_gateway && python3 -m pytest tests/ -v`
2. Read all source files under `api_gateway/`
3. Trace and fix the root cause
4. Re-run — all tests must pass

## Post-Fix Checklist

- [ ] All four modules pass their full test suites
- [ ] No test files were modified
- [ ] Each fix is minimal — only the root cause was changed
