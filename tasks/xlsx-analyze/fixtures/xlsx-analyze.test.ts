import { describe, test, expect } from "bun:test"
import { existsSync, readFileSync } from "fs"

function loadAnalysis(): any {
  const raw = readFileSync("expense_analysis.json", "utf-8")
  return JSON.parse(raw)
}

describe("expense_analysis.json", () => {
  test("exists and is valid JSON", () => {
    expect(existsSync("expense_analysis.json")).toBe(true)
    expect(() => loadAnalysis()).not.toThrow()
  })

  test("has all 4 categories in total_by_category", () => {
    const data = loadAnalysis()
    const cats = Object.keys(data.total_by_category).map((k: string) => k.toLowerCase())
    expect(cats).toContain("travel")
    expect(cats).toContain("software")
    expect(cats).toContain("equipment")
    expect(cats).toContain("training")
  })

  test("Travel total is correct (6900)", () => {
    const data = loadAnalysis()
    const byCategory = normalizeKeys(data.total_by_category)
    expect(Math.abs(byCategory["travel"] - 6900)).toBeLessThan(1)
  })

  test("grand_total is correct (33400)", () => {
    const data = loadAnalysis()
    expect(Math.abs(data.grand_total - 33400)).toBeLessThan(1)
  })

  test("highest_category is Training", () => {
    const data = loadAnalysis()
    expect(data.highest_category.toLowerCase()).toBe("training")
  })

  test("approval_rate is 75%", () => {
    const data = loadAnalysis()
    // Accept both 0.75 and 75 representations
    const rate = data.approval_rate > 1 ? data.approval_rate : data.approval_rate * 100
    expect(Math.abs(rate - 75)).toBeLessThan(1)
  })

  test("has all 6 months in total_by_month", () => {
    const data = loadAnalysis()
    const months = Object.keys(data.total_by_month).map((k: string) => k.toLowerCase().slice(0, 3))
    expect(months).toContain("jan")
    expect(months).toContain("feb")
    expect(months).toContain("mar")
    expect(months).toContain("apr")
    expect(months).toContain("may")
    expect(months).toContain("jun")
  })
})

/** Lowercase all keys in an object */
function normalizeKeys(obj: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [k, v] of Object.entries(obj)) {
    result[k.toLowerCase()] = v
  }
  return result
}
