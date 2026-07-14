import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

interface StationReport {
  name: string
  max_severity: string
  flood_days: number
  peak_flow: number
  peak_date: string
}

interface FloodReport {
  stations: StationReport[]
}

function loadReport(): FloodReport {
  const raw = readFileSync("flood_report.json", "utf-8")
  return JSON.parse(raw)
}

function findStation(report: FloodReport, name: string): StationReport | undefined {
  return report.stations.find(
    (s) => s.name === name || s.name === name.toLowerCase() || s.name.includes(name)
  )
}

describe("flood_report.json", () => {
  test("output exists and is valid JSON", () => {
    expect(existsSync("flood_report.json")).toBe(true)
    const raw = readFileSync("flood_report.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("station count is 3", () => {
    const report = loadReport()
    expect(report.stations).toBeDefined()
    expect(Array.isArray(report.stations)).toBe(true)
    expect(report.stations.length).toBe(3)
  })

  test("station A has moderate severity and 2 flood days", () => {
    const report = loadReport()
    const stationA = findStation(report, "station_A") ?? findStation(report, "A")
    expect(stationA).toBeDefined()
    expect(stationA!.max_severity).toBe("moderate")
    expect(stationA!.flood_days).toBe(2)
  })

  test("station B has none severity and 0 flood days", () => {
    const report = loadReport()
    const stationB = findStation(report, "station_B") ?? findStation(report, "B")
    expect(stationB).toBeDefined()
    expect(stationB!.max_severity).toBe("none")
    expect(stationB!.flood_days).toBe(0)
  })

  test("station C has minor severity and 5 flood days", () => {
    const report = loadReport()
    const stationC = findStation(report, "station_C") ?? findStation(report, "C")
    expect(stationC).toBeDefined()
    expect(stationC!.max_severity).toBe("minor")
    expect(stationC!.flood_days).toBe(5)
  })

  test("peak flows are within expected ranges", () => {
    const report = loadReport()
    const stationA = findStation(report, "station_A") ?? findStation(report, "A")
    const stationB = findStation(report, "station_B") ?? findStation(report, "B")
    const stationC = findStation(report, "station_C") ?? findStation(report, "C")

    // Station A peak should be 2800 (moderate flood day)
    expect(stationA).toBeDefined()
    expect(Math.abs(Number(stationA!.peak_flow) - 2800)).toBeLessThan(1)

    // Station B peak should be 500 (no flood)
    expect(stationB).toBeDefined()
    expect(Math.abs(Number(stationB!.peak_flow) - 500)).toBeLessThan(1)

    // Station C peak should be 750 (minor flood)
    expect(stationC).toBeDefined()
    expect(Math.abs(Number(stationC!.peak_flow) - 750)).toBeLessThan(1)
  })
})
