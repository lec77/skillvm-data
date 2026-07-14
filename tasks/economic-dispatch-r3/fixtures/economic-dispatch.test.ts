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
      { min: 30, max: 150 },
      { min: 70, max: 240 },
      { min: 60, max: 210 },
      { min: 45, max: 200 },
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
      { a: 0.009, b: 10.5, c: 300 },
      { a: 0.005, b: 8.0, c: 480 },
      { a: 0.0035, b: 7.0, c: 520 },
      { a: 0.0065, b: 8.5, c: 350 },
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
