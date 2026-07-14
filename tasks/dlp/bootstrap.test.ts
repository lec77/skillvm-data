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

describe("bootstrap-15-files", () => {
  test("all 15 report files exist", () => {
    for (let i = 1; i <= 15; i++) {
      const name = `data_${String(i).padStart(2, "0")}_report.json`
      expect(existsSync(path.join(workDir, name))).toBe(true)
    }
  })

  for (let i = 1; i <= 15; i++) {
    const tag = String(i).padStart(2, "0")
    test(`CI accuracy for data_${tag}`, () => {
      const actual = loadJSON(path.join(workDir, `data_${tag}_report.json`))
      const expected = loadExpected(`data_${tag}_report.json`)
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

  for (let i = 1; i <= 15; i++) {
    const tag = String(i).padStart(2, "0")
    test(`outlier counts match for data_${tag}`, () => {
      const actual = loadJSON(path.join(workDir, `data_${tag}_report.json`))
      const expected = loadExpected(`data_${tag}_report.json`)
      expect(actual).not.toBeNull()
      for (const col of Object.keys(expected.columns)) {
        expect(actual.columns[col].outlier_count).toBe(expected.columns[col].outlier_count)
      }
    })
  }

  for (let i = 1; i <= 15; i++) {
    const tag = String(i).padStart(2, "0")
    test(`correlations match for data_${tag}`, () => {
      const actual = loadJSON(path.join(workDir, `data_${tag}_report.json`))
      const expected = loadExpected(`data_${tag}_report.json`)
      expect(actual).not.toBeNull()
      for (const [key, val] of Object.entries(expected.correlations)) {
        expect(actual.correlations[key]).toBeCloseTo(val as number, 4)
      }
    })
  }

  test("summary.json exists and is valid", () => {
    const s = loadJSON(path.join(workDir, "summary.json"))
    expect(s).not.toBeNull()
    expect(s.total_files_processed).toBe(15)
    expect(s.per_file_outliers).toBeDefined()
    expect(s.overall_mean).toBeDefined()
  })

  test("summary aggregates are correct", () => {
    const s = loadJSON(path.join(workDir, "summary.json"))
    expect(s).not.toBeNull()
    expect(Object.keys(s.per_file_outliers).length).toBe(15)
    expect(typeof s.overall_mean).toBe("number")
    expect(Number.isFinite(s.overall_mean)).toBe(true)
  })
})
