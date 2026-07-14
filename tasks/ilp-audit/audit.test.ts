import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"
import path from "path"

const workDir = process.env.WORK_DIR || process.cwd()
const expectedDir = path.join(import.meta.dirname, "expected")

// Each section is written by a DIFFERENT analyzer to a DIFFERENT filename —
// they cannot be produced by one fan-out loop, so the parallel arm must issue
// four independent tool calls (instruction-level parallelism).
const SECTIONS = ["secrets_scan", "complexity_metrics", "dep_audit", "perf_probe"]

function loadJSON(fp: string) {
  if (!existsSync(fp)) return null
  return JSON.parse(readFileSync(fp, "utf-8"))
}
function loadExpected(name: string) {
  return JSON.parse(readFileSync(path.join(expectedDir, `${name}.json`), "utf-8"))
}

describe("ilp-audit-release", () => {
  test("all section reports exist", () => {
    for (const s of SECTIONS) {
      expect(existsSync(path.join(workDir, `${s}.json`))).toBe(true)
    }
    expect(existsSync(path.join(workDir, "release_report.json"))).toBe(true)
  })

  for (const s of SECTIONS) {
    test(`values match for ${s}`, () => {
      const actual = loadJSON(path.join(workDir, `${s}.json`))
      const expected = loadExpected(s)
      expect(actual).not.toBeNull()
      for (const key of Object.keys(expected)) {
        if (key === "fingerprint" || key === "hotpath_signature") continue
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
      // The fingerprint is the chained-SHA proof that the CPU-bound analysis ran.
      expect(actual.fingerprint).toBe(expected.fingerprint)
    })
  }

  test("release_report is valid", () => {
    const actual = loadJSON(path.join(workDir, "release_report.json"))
    const expected = loadExpected("release_report")
    expect(actual).not.toBeNull()
    expect(actual.combined_fingerprint).toBe(expected.combined_fingerprint)
    expect(typeof actual.ready).toBe("boolean")
    expect(Array.isArray(actual.blockers)).toBe(true)
    expect(actual.ready).toBe(expected.ready)
  })
})
