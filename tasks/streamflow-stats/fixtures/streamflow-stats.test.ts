import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

// Expected values derived from annual_peaks.csv with Log-Pearson Type III fit
// Data: 30 uniformly-spaced log values centred at 2.95 with std≈0.2034
// mean_log ≈ 2.9500, std_log ≈ 0.2034, skew ≈ 0.0
// Q10  = 10^(2.95 + 1.282 * 0.2034) ≈ 1625
// Q50  = 10^(2.95 + 2.054 * 0.2034) ≈ 2332
// Q100 = 10^(2.95 + 2.326 * 0.2034) ≈ 2649

const EXPECTED_MEAN = 2.95
const EXPECTED_STD = 0.2034
const EXPECTED_Q10 = 1625
const EXPECTED_Q50 = 2332
const EXPECTED_Q100 = 2649

interface ReturnPeriods {
  log_stats: { mean: number; std: number; skew: number }
  return_periods: { rp_10: number; rp_50: number; rp_100: number }
}

function loadResult(): ReturnPeriods {
  const raw = readFileSync("return_periods.json", "utf-8")
  return JSON.parse(raw)
}

describe("return_periods.json", () => {
  test("output exists and is valid JSON", () => {
    expect(existsSync("return_periods.json")).toBe(true)
    const raw = readFileSync("return_periods.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("log mean is within 0.05 of 2.95", () => {
    const result = loadResult()
    expect(result.log_stats).toBeDefined()
    expect(result.log_stats.mean).toBeDefined()
    expect(Math.abs(Number(result.log_stats.mean) - EXPECTED_MEAN)).toBeLessThan(0.05)
  })

  test("log std is within 0.03 of expected", () => {
    const result = loadResult()
    expect(result.log_stats.std).toBeDefined()
    // Allow tolerance: std could be computed from raw data (≈0.2034)
    expect(Math.abs(Number(result.log_stats.std) - EXPECTED_STD)).toBeLessThan(0.03)
  })

  test("rp_10 is within 10% of expected 1625", () => {
    const result = loadResult()
    expect(result.return_periods).toBeDefined()
    expect(result.return_periods.rp_10).toBeDefined()
    const rp10 = Number(result.return_periods.rp_10)
    expect(Math.abs(rp10 - EXPECTED_Q10) / EXPECTED_Q10).toBeLessThan(0.1)
  })

  test("rp_50 is within 10% of expected 2332", () => {
    const result = loadResult()
    expect(result.return_periods.rp_50).toBeDefined()
    const rp50 = Number(result.return_periods.rp_50)
    expect(Math.abs(rp50 - EXPECTED_Q50) / EXPECTED_Q50).toBeLessThan(0.1)
  })

  test("rp_100 is within 10% of expected 2649", () => {
    const result = loadResult()
    expect(result.return_periods.rp_100).toBeDefined()
    const rp100 = Number(result.return_periods.rp_100)
    expect(Math.abs(rp100 - EXPECTED_Q100) / EXPECTED_Q100).toBeLessThan(0.1)
  })
})
