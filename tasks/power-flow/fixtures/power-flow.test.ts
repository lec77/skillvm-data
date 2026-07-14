import { describe, test, expect } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("power-flow", () => {
  test("output file exists", () => {
    expect(existsSync("power_flow.json")).toBe(true)
  })

  test("slack bus angle is zero", () => {
    const r = JSON.parse(readFileSync("power_flow.json", "utf-8"))
    expect(Array.isArray(r.bus_angles)).toBe(true)
    expect(r.bus_angles.length).toBe(5)
    expect(Math.abs(r.bus_angles[0])).toBeLessThan(1e-9)
  })

  test("power balance: total generation equals total load", () => {
    const r = JSON.parse(readFileSync("power_flow.json", "utf-8"))
    const totalLoad = 50 + 40 + 30 + 60 // 180 MW
    const totalGen = r.generation.reduce((sum: number, g: number) => sum + g, 0)
    expect(Math.abs(totalGen - totalLoad)).toBeLessThan(1.0)
  })

  test("line flows within limits", () => {
    const r = JSON.parse(readFileSync("power_flow.json", "utf-8"))
    const limits = [80, 60, 50, 70, 55, 60]
    expect(r.line_flows.length).toBe(6)
    for (let i = 0; i < 6; i++) {
      expect(Math.abs(r.line_flows[i])).toBeLessThanOrEqual(limits[i] + 0.1)
    }
  })

  test("angles are reasonable: all |theta| < 1.0 rad", () => {
    const r = JSON.parse(readFileSync("power_flow.json", "utf-8"))
    for (const angle of r.bus_angles) {
      expect(Math.abs(angle)).toBeLessThan(1.0)
    }
  })

  test("generation values: bus 3 produces 60 MW and slack picks up remainder", () => {
    const r = JSON.parse(readFileSync("power_flow.json", "utf-8"))
    expect(Array.isArray(r.generation)).toBe(true)
    expect(r.generation.length).toBe(2)
    // Bus 3 fixed at 60 MW
    expect(Math.abs(r.generation[1] - 60)).toBeLessThan(0.1)
    // Slack bus picks up remaining 120 MW (total load 180 - bus3 gen 60)
    expect(Math.abs(r.generation[0] - 120)).toBeLessThan(1.0)
  })
})
