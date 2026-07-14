import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("detrending_results.json", () => {
  test("output exists and is valid JSON", () => {
    expect(existsSync("detrending_results.json")).toBe(true)
    const raw = readFileSync("detrending_results.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("array lengths are all 60", () => {
    const results = JSON.parse(readFileSync("detrending_results.json", "utf-8"))
    expect(Array.isArray(results.gdp_trend)).toBe(true)
    expect(Array.isArray(results.gdp_cycle)).toBe(true)
    expect(Array.isArray(results.cons_trend)).toBe(true)
    expect(Array.isArray(results.cons_cycle)).toBe(true)
    expect(results.gdp_trend.length).toBe(60)
    expect(results.gdp_cycle.length).toBe(60)
    expect(results.cons_trend.length).toBe(60)
    expect(results.cons_cycle.length).toBe(60)
  })

  test("GDP trend is mostly monotonically increasing", () => {
    const results = JSON.parse(readFileSync("detrending_results.json", "utf-8"))
    const trend: number[] = results.gdp_trend
    // Count increasing steps — allow up to 10% non-increasing (HP trend should be smooth)
    let increasing = 0
    for (let i = 1; i < trend.length; i++) {
      if (trend[i] > trend[i - 1]) increasing++
    }
    // At least 85% of consecutive pairs should be increasing
    expect(increasing).toBeGreaterThanOrEqual(50)
  })

  test("GDP cycle mean is close to zero", () => {
    const results = JSON.parse(readFileSync("detrending_results.json", "utf-8"))
    const cycle: number[] = results.gdp_cycle
    const mean = cycle.reduce((a, b) => a + b, 0) / cycle.length
    // Mean of cycle should be near zero (within ±0.05 in log space)
    expect(Math.abs(mean)).toBeLessThan(0.05)
  })

  test("consumption cycle mean is close to zero", () => {
    const results = JSON.parse(readFileSync("detrending_results.json", "utf-8"))
    const cycle: number[] = results.cons_cycle
    const mean = cycle.reduce((a, b) => a + b, 0) / cycle.length
    expect(Math.abs(mean)).toBeLessThan(0.05)
  })

  test("cyclical correlation is positive", () => {
    const results = JSON.parse(readFileSync("detrending_results.json", "utf-8"))
    expect(typeof results.cyclical_correlation).toBe("number")
    expect(results.cyclical_correlation).toBeGreaterThan(0)
  })

  test("cyclical correlation is in plausible range 0.5 to 1.0", () => {
    const results = JSON.parse(readFileSync("detrending_results.json", "utf-8"))
    expect(results.cyclical_correlation).toBeGreaterThanOrEqual(0.5)
    expect(results.cyclical_correlation).toBeLessThanOrEqual(1.0)
  })
})
