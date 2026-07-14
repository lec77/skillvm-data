import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"
import path from "path"

const workDir = process.env.WORK_DIR || process.cwd()
const expectedDir = path.join(import.meta.dirname, "expected")

function loadJSON(fp: string) {
  if (!existsSync(fp)) return null
  return JSON.parse(readFileSync(fp, "utf-8"))
}
function loadExpected(name: string) {
  return JSON.parse(readFileSync(path.join(expectedDir, name), "utf-8"))
}

describe("dlp-log-20-files", () => {
  test("all 20 report files exist", () => {
    for (let i = 1; i <= 20; i++) {
      const name = `log_${String(i).padStart(2, "0")}_report.json`
      expect(existsSync(path.join(workDir, name))).toBe(true)
    }
  })

  for (let i = 1; i <= 20; i++) {
    const tag = String(i).padStart(2, "0")
    test(`error_rate accuracy for log_${tag}`, () => {
      const actual = loadJSON(path.join(workDir, `log_${tag}_report.json`))
      const expected = loadExpected(`log_${tag}_report.json`)
      expect(actual).not.toBeNull()
      expect(actual.error_rate).toBeCloseTo(expected.error_rate, 4)
    })
  }

  for (let i = 1; i <= 20; i++) {
    const tag = String(i).padStart(2, "0")
    test(`status_codes match for log_${tag}`, () => {
      const actual = loadJSON(path.join(workDir, `log_${tag}_report.json`))
      const expected = loadExpected(`log_${tag}_report.json`)
      expect(actual).not.toBeNull()
      expect(actual.total_requests).toBe(expected.total_requests)
      for (const [code, count] of Object.entries(expected.status_codes)) {
        expect(actual.status_codes[code]).toBe(count)
      }
    })
  }

  for (let i = 1; i <= 20; i++) {
    const tag = String(i).padStart(2, "0")
    test(`response_time CI for log_${tag}`, () => {
      const actual = loadJSON(path.join(workDir, `log_${tag}_report.json`))
      const expected = loadExpected(`log_${tag}_report.json`)
      expect(actual).not.toBeNull()
      expect(actual.response_time_ci_lower).toBeCloseTo(expected.response_time_ci_lower, 1)
      expect(actual.response_time_ci_upper).toBeCloseTo(expected.response_time_ci_upper, 1)
    })
  }

  test("log_summary.json exists and is valid", () => {
    const s = loadJSON(path.join(workDir, "log_summary.json"))
    expect(s).not.toBeNull()
    expect(s.files_processed).toBe(20)
    expect(typeof s.overall_error_rate).toBe("number")
    expect(s.aggregate_status_codes).toBeDefined()
  })
})
