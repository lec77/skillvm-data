import { describe, test, expect } from "bun:test"
import { existsSync, readFileSync } from "fs"

interface GeneratorDispatch {
  id: number
  power: number
  cost: number
}

describe("economic-dispatch", () => {
  test("output file exists", () => {
    expect(existsSync("dispatch.json")).toBe(true)
  })

  test("power balance: total dispatched power equals 500 MW demand", () => {
    const r = JSON.parse(readFileSync("dispatch.json", "utf-8"))
    expect(Array.isArray(r.dispatch)).toBe(true)
    expect(r.dispatch.length).toBe(4)
    const totalPower = r.dispatch.reduce((sum: number, g: GeneratorDispatch) => sum + g.power, 0)
    expect(Math.abs(totalPower - 500)).toBeLessThan(0.1)
  })

  test("all generators within min/max limits", () => {
    const r = JSON.parse(readFileSync("dispatch.json", "utf-8"))
    const limits = [
      { min: 55, max: 230 },
      { min: 35, max: 170 },
      { min: 45, max: 220 },
      { min: 25, max: 160 },
    ]
    for (const g of r.dispatch as GeneratorDispatch[]) {
      const { min, max } = limits[g.id]
      expect(g.power).toBeGreaterThanOrEqual(min - 0.01)
      expect(g.power).toBeLessThanOrEqual(max + 0.01)
    }
  })

  test("individual costs are correct given dispatch powers", () => {
    const r = JSON.parse(readFileSync("dispatch.json", "utf-8"))
    const params = [
      { a: 0.0045, b: 8.5, c: 520 },
      { a: 0.0075, b: 6.0, c: 360 },
      { a: 0.0055, b: 9.0, c: 280 },
      { a: 0.01, b: 11.5, c: 200 },
    ]
    for (const g of r.dispatch as GeneratorDispatch[]) {
      const { a, b, c } = params[g.id]
      const expectedCost = a * g.power ** 2 + b * g.power + c
      expect(Math.abs(g.cost - expectedCost)).toBeLessThan(1.0)
    }
  })

  test("lambda is positive and a number", () => {
    const r = JSON.parse(readFileSync("dispatch.json", "utf-8"))
    expect(typeof r.lambda).toBe("number")
    expect(r.lambda).toBeGreaterThan(0)
  })

  test("total cost consistent with sum of individual costs", () => {
    const r = JSON.parse(readFileSync("dispatch.json", "utf-8"))
    const sumIndividual = r.dispatch.reduce(
      (sum: number, g: GeneratorDispatch) => sum + g.cost,
      0
    )
    expect(Math.abs(r.total_cost - sumIndividual)).toBeLessThan(1.0)
  })
})
