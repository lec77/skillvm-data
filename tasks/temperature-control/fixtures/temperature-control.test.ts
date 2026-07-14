import { describe, test, expect } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("temperature-control", () => {
  test("output file exists", () => {
    expect(existsSync("thermal_output.json")).toBe(true)
  })

  test("arrays have correct length", () => {
    const r = JSON.parse(readFileSync("thermal_output.json", "utf-8"))
    expect(r.temperatures.length).toBe(500)
    expect(r.control_signals.length).toBe(500)
  })

  test("steady state error is small before disturbance", () => {
    const r = JSON.parse(readFileSync("thermal_output.json", "utf-8"))
    const preDisturbTemps = r.temperatures.slice(200, 290)
    const avgError = preDisturbTemps.reduce((a: number, b: number) => a + Math.abs(b - 22.0), 0) / preDisturbTemps.length
    expect(avgError).toBeLessThan(0.5)
  })

  test("recovers from disturbance", () => {
    const r = JSON.parse(readFileSync("thermal_output.json", "utf-8"))
    const postRecovery = r.temperatures.slice(450)
    const avgError = postRecovery.reduce((a: number, b: number) => a + Math.abs(b - 22.0), 0) / postRecovery.length
    expect(avgError).toBeLessThan(1.0)
  })

  test("no excessive overshoot", () => {
    const r = JSON.parse(readFileSync("thermal_output.json", "utf-8"))
    const maxTemp = Math.max(...r.temperatures)
    expect(maxTemp).toBeLessThan(22.0 + 22.0 * 0.15)
  })

  test("control signal within bounds", () => {
    const r = JSON.parse(readFileSync("thermal_output.json", "utf-8"))
    const maxU = Math.max(...r.control_signals)
    const minU = Math.min(...r.control_signals)
    expect(maxU).toBeLessThanOrEqual(100.1)
    expect(minU).toBeGreaterThanOrEqual(-0.1)
  })
})
