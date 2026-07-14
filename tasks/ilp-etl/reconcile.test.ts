import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"
import path from "path"

const workDir = process.env.WORK_DIR || process.cwd()
const expectedDir = path.join(import.meta.dirname, "expected")

// Four DIFFERENT formats parsed by four DIFFERENT tools writing four DIFFERENT
// filenames — no single fan-out loop can produce them, so the parallel arm must
// issue four independent tool calls (instruction-level parallelism).
const SECTIONS = ["orders_parsed", "events_rollup", "ledger_decoded", "inventory_tally"]

function loadJSON(fp: string) {
  if (!existsSync(fp)) return null
  return JSON.parse(readFileSync(fp, "utf-8"))
}
function loadExpected(name: string) {
  return JSON.parse(readFileSync(path.join(expectedDir, `${name}.json`), "utf-8"))
}

describe("ilp-etl-reconcile", () => {
  test("all source extracts exist", () => {
    for (const s of SECTIONS) {
      expect(existsSync(path.join(workDir, `${s}.json`))).toBe(true)
    }
    expect(existsSync(path.join(workDir, "reconciliation.json"))).toBe(true)
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

  test("reconciliation is valid", () => {
    const actual = loadJSON(path.join(workDir, "reconciliation.json"))
    const expected = loadExpected("reconciliation")
    expect(actual).not.toBeNull()
    expect(actual.combined_fingerprint).toBe(expected.combined_fingerprint)
    expect(actual.sources_reconciled).toBe(4)
    expect(typeof actual.balanced).toBe("boolean")
    expect(actual.balanced).toBe(expected.balanced)
  })
})
