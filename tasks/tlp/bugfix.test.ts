import { expect, test, describe } from "bun:test"
import { spawnSync } from "child_process"
import path from "path"

const workDir = process.env.WORK_DIR || process.cwd()

function runPytest(serviceDir: string): { passed: number; failed: number; total: number; output: string } {
  const result = spawnSync("python3", ["-m", "pytest", "tests/", "-v", "--tb=short"], {
    cwd: path.join(workDir, serviceDir),
    encoding: "utf-8",
    timeout: 30000,
  })
  const output = (result.stdout || "") + (result.stderr || "")
  const passed = parseInt((output.match(/(\d+) passed/) || ["0", "0"])[1])
  const failed = parseInt((output.match(/(\d+) failed/) || ["0", "0"])[1])
  return { passed, failed, total: passed + failed, output }
}

describe("multi-service-bugfix", () => {
  // --- auth_service ---
  test("auth_service: all tests pass", () => {
    const r = runPytest("auth_service")
    expect(r.total).toBeGreaterThan(0)
    expect(r.failed).toBe(0)
  })

  test("auth_service: previously-failing tests now pass", () => {
    const r = runPytest("auth_service")
    expect(r.output).toContain("PASSED")
    // These specific tests should now pass
    expect(r.output).not.toContain("FAILED")
  })

  // --- data_pipeline ---
  test("data_pipeline: all tests pass", () => {
    const r = runPytest("data_pipeline")
    expect(r.total).toBeGreaterThan(0)
    expect(r.failed).toBe(0)
  })

  test("data_pipeline: previously-failing tests now pass", () => {
    const r = runPytest("data_pipeline")
    expect(r.output).toContain("PASSED")
    expect(r.output).not.toContain("FAILED")
  })

  // --- task_scheduler ---
  test("task_scheduler: all tests pass", () => {
    const r = runPytest("task_scheduler")
    expect(r.total).toBeGreaterThan(0)
    expect(r.failed).toBe(0)
  })

  test("task_scheduler: previously-failing tests now pass", () => {
    const r = runPytest("task_scheduler")
    expect(r.output).toContain("PASSED")
    expect(r.output).not.toContain("FAILED")
  })
})
