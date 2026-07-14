import { describe, test, expect } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("cruise-control", () => {
  test("output file exists", () => {
    expect(existsSync("control_output.json")).toBe(true)
  })

  test("arrays have correct length", () => {
    const r = JSON.parse(readFileSync("control_output.json", "utf-8"))
    expect(r.ego_speeds.length).toBe(200)
    expect(r.gap_distances.length).toBe(200)
    expect(r.accelerations.length).toBe(200)
  })

  test("no collision occurs", () => {
    const r = JSON.parse(readFileSync("control_output.json", "utf-8"))
    const minGap = Math.min(...r.gap_distances)
    expect(minGap).toBeGreaterThan(0)
  })

  test("speed tracks target in steady state", () => {
    const r = JSON.parse(readFileSync("control_output.json", "utf-8"))
    // Last 20 steps should be near lead vehicle speed (25 m/s) or target
    const lastSpeeds = r.ego_speeds.slice(-20)
    const avgSpeed = lastSpeeds.reduce((a: number, b: number) => a + b, 0) / lastSpeeds.length
    expect(Math.abs(avgSpeed - 25.0)).toBeLessThan(3.0)
  })

  test("acceleration within limits", () => {
    const r = JSON.parse(readFileSync("control_output.json", "utf-8"))
    const maxA = Math.max(...r.accelerations)
    const minA = Math.min(...r.accelerations)
    expect(maxA).toBeLessThanOrEqual(3.1)
    expect(minA).toBeGreaterThanOrEqual(-5.1)
  })

  test("safe gap maintained in steady state", () => {
    const r = JSON.parse(readFileSync("control_output.json", "utf-8"))
    // After initial transient (first 50 steps), gap should generally be safe
    const steadyGaps = r.gap_distances.slice(50)
    const violations = steadyGaps.filter((g: number, i: number) => {
      const speed = r.ego_speeds[i + 50]
      const safeGap = 10.0 + speed * 1.5
      return g < safeGap * 0.8 // Allow 20% tolerance
    }).length
    expect(violations).toBeLessThan(steadyGaps.length * 0.1) // <10% violations
  })
})
