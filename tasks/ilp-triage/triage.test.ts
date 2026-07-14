import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"
import path from "path"

const workDir = process.env.WORK_DIR || process.cwd()
const expectedDir = path.join(import.meta.dirname, "expected")

// Four DIFFERENT signal sources probed by four DIFFERENT tools writing four
// DIFFERENT filenames — no single fan-out loop can produce them, so the parallel
// arm must issue four independent tool calls (instruction-level parallelism).
const SECTIONS = ["log_scan", "config_drift", "threshold_check", "alert_correlation"]

function loadJSON(fp: string) {
  if (!existsSync(fp)) return null
  return JSON.parse(readFileSync(fp, "utf-8"))
}
function loadExpected(name: string) {
  return JSON.parse(readFileSync(path.join(expectedDir, `${name}.json`), "utf-8"))
}

describe("ilp-triage-incident", () => {
  test("all signal reports exist", () => {
    for (const s of SECTIONS) {
      expect(existsSync(path.join(workDir, `${s}.json`))).toBe(true)
    }
    expect(existsSync(path.join(workDir, "triage_report.json"))).toBe(true)
  })

  for (const s of SECTIONS) {
    test(`values match for ${s}`, () => {
      const actual = loadJSON(path.join(workDir, `${s}.json`))
      const expected = loadExpected(s)
      expect(actual).not.toBeNull()
      for (const key of Object.keys(expected)) {
        if (key === "fingerprint") continue
        if (typeof expected[key] === "number" && !Number.isInteger(expected[key])) {
          expect(actual[key]).toBeCloseTo(expected[key], 2)
        } else {
          expect(actual[key]).toEqual(expected[key])
        }
      }
    })
  }

  for (const s of SECTIONS) {
    test(`fingerprint matches for ${s}`, () => {
      const actual = loadJSON(path.join(workDir, `${s}.json`))
      const expected = loadExpected(s)
      expect(actual).not.toBeNull()
      expect(actual.fingerprint).toBe(expected.fingerprint)
    })
  }

  test("triage_report is valid", () => {
    const actual = loadJSON(path.join(workDir, "triage_report.json"))
    const expected = loadExpected("triage_report")
    expect(actual).not.toBeNull()
    expect(actual.combined_fingerprint).toBe(expected.combined_fingerprint)
    expect(actual.signals).toBe(4)
    expect(actual.severity).toBe(expected.severity)
  })
})
