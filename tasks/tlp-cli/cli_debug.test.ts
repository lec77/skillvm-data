import { expect, test, describe } from "bun:test"
import { spawnSync } from "bun"
import path from "path"

const workDir = process.env.WORK_DIR || process.cwd()

const MODULES = ["csv_cleaner", "log_filter", "data_merger", "stats_reporter"]

describe("tlp-cli-4-tools", () => {
  for (const mod of MODULES) {
    test(`${mod}: all tests pass`, () => {
      const result = spawnSync(
        ["python3", "-m", "pytest", "tests/", "-v", "--tb=short", "-q"],
        {
          cwd: path.join(workDir, mod),
          env: process.env,
        }
      )
      const output = result.stdout.toString() + result.stderr.toString()
      const failMatch = output.match(/(\d+) failed/)
      const passMatch = output.match(/(\d+) passed/)
      const failed = failMatch ? parseInt(failMatch[1]) : 0
      const passed = passMatch ? parseInt(passMatch[1]) : 0
      expect(failed).toBe(0)
      expect(passed).toBeGreaterThan(0)
    })
  }
})
