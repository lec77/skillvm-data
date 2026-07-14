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

describe("dlp-metrics-25-files", () => {
  test("all 25 profile files exist", () => {
    for (let i = 1; i <= 25; i++) {
      const name = `metrics_${String(i).padStart(2, "0")}_profile.json`
      expect(existsSync(path.join(workDir, name))).toBe(true)
    }
  })

  for (let i = 1; i <= 25; i++) {
    const tag = String(i).padStart(2, "0")
    test(`CI accuracy for metrics_${tag}`, () => {
      const actual = loadJSON(path.join(workDir, `metrics_${tag}_profile.json`))
      const expected = loadExpected(`metrics_${tag}_profile.json`)
      expect(actual).not.toBeNull()
      for (const col of Object.keys(expected.columns)) {
        const ec = expected.columns[col]
        const ac = actual.columns[col]
        expect(ac).toBeDefined()
        expect(ac.ci_lower).toBeCloseTo(ec.ci_lower, 4)
        expect(ac.ci_upper).toBeCloseTo(ec.ci_upper, 4)
      }
    })
  }

  for (let i = 1; i <= 25; i++) {
    const tag = String(i).padStart(2, "0")
    test(`column stats match for metrics_${tag}`, () => {
      const actual = loadJSON(path.join(workDir, `metrics_${tag}_profile.json`))
      const expected = loadExpected(`metrics_${tag}_profile.json`)
      expect(actual).not.toBeNull()
      for (const col of Object.keys(expected.columns)) {
        const ec = expected.columns[col]
        const ac = actual.columns[col]
        expect(ac).toBeDefined()
        expect(ac.mean).toBeCloseTo(ec.mean, 4)
        expect(ac.p95).toBeCloseTo(ec.p95, 4)
        expect(ac.p99).toBeCloseTo(ec.p99, 4)
      }
    })
  }

  test("metrics_summary.json is valid", () => {
    const s = loadJSON(path.join(workDir, "metrics_summary.json"))
    expect(s).not.toBeNull()
    expect(s.total_files).toBe(25)
    expect(Number.isFinite(s.avg_cpu_mean)).toBe(true)
    expect(Number.isFinite(s.avg_mem_mean)).toBe(true)
    expect(Array.isArray(s.peak_cpu_files)).toBe(true)
  })
})
