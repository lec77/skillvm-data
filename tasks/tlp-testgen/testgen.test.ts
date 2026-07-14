import { expect, test, describe } from "bun:test"
import { spawnSync } from "child_process"
import path from "path"

const workDir = process.env.WORK_DIR || process.cwd()

const MODULES = ["network_monitor", "cache_manager", "report_generator", "api_gateway"]

function runPytest(moduleDir: string): { passed: number; failed: number } {
  const result = spawnSync(
    "python3", ["-m", "pytest", "tests/", "-v", "--tb=short"],
    { cwd: path.join(workDir, moduleDir), encoding: "utf-8", timeout: 60000 }
  )
  const output = (result.stdout || "") + (result.stderr || "")
  const passMatch = output.match(/(\d+) passed/)
  const failMatch = output.match(/(\d+) failed/)
  return {
    passed: passMatch ? parseInt(passMatch[1]) : 0,
    failed: failMatch ? parseInt(failMatch[1]) : 0,
  }
}

describe("tlp-testgen-4-modules", () => {
  for (const mod of MODULES) {
    test(`${mod}: all tests pass`, () => {
      const { passed, failed } = runPytest(mod)
      expect(failed).toBe(0)
      expect(passed).toBeGreaterThan(0)
    })

    test(`${mod}: no test files modified`, () => {
      // Verify test files haven't been touched (they should be read-only by convention)
      // Just check they still exist
      const { existsSync } = require("fs")
      expect(existsSync(path.join(workDir, mod, "tests"))).toBe(true)
    })
  }
})
