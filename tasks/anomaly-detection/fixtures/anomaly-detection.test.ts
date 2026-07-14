import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

// Known injected anomalies:
// Day 45  → 2025-02-14 → spike (+500 above normal ~230)
// Day 150 → 2025-05-30 → dip  (-150 below normal ~245)
// Days 280-290 → level shift (+100)

// Date range window for detection tolerance (±5 days)
const SPIKE_DATE = "2025-02-14"
const DIP_DATE   = "2025-05-30"

function datePlusDays(date: string, delta: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d.toISOString().split("T")[0]
}

function inWindow(date: string, center: string, radius: number): boolean {
  const start = datePlusDays(center, -radius)
  const end   = datePlusDays(center, radius)
  return date >= start && date <= end
}

describe("anomaly_report.json", () => {
  test("output exists and is valid JSON", () => {
    expect(existsSync("anomaly_report.json")).toBe(true)
    const raw = readFileSync("anomaly_report.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("minimum anomalies detected (at least 3)", () => {
    const report = JSON.parse(readFileSync("anomaly_report.json", "utf-8"))
    expect(typeof report.total_anomalies).toBe("number")
    expect(report.total_anomalies).toBeGreaterThanOrEqual(3)
    expect(Array.isArray(report.anomalies)).toBe(true)
    expect(report.anomalies.length).toBeGreaterThanOrEqual(3)
  })

  test("spike detected near 2025-02-14 (day 45)", () => {
    const report = JSON.parse(readFileSync("anomaly_report.json", "utf-8"))
    const anomalies: Array<{ date: string; sales: number; z_score: number; type?: string }> = report.anomalies
    // Check that at least one anomaly falls within ±5 days of the spike date
    const spikeFound = anomalies.some(a => inWindow(a.date, SPIKE_DATE, 5) && a.z_score > 0)
    expect(spikeFound).toBe(true)
  })

  test("dip detected near 2025-05-30 (day 150)", () => {
    const report = JSON.parse(readFileSync("anomaly_report.json", "utf-8"))
    const anomalies: Array<{ date: string; sales: number; z_score: number; type?: string }> = report.anomalies
    // Check that at least one anomaly falls within ±5 days of the dip date with negative z-score
    const dipFound = anomalies.some(a => inWindow(a.date, DIP_DATE, 5) && a.z_score < 0)
    expect(dipFound).toBe(true)
  })

  test("mean sales is in realistic range 180-240", () => {
    const report = JSON.parse(readFileSync("anomaly_report.json", "utf-8"))
    expect(typeof report.mean_sales).toBe("number")
    expect(report.mean_sales).toBeGreaterThanOrEqual(180)
    expect(report.mean_sales).toBeLessThanOrEqual(240)
  })

  test("all flagged anomalies have |z_score| > 2.0", () => {
    const report = JSON.parse(readFileSync("anomaly_report.json", "utf-8"))
    const anomalies: Array<{ date: string; sales: number; z_score: number }> = report.anomalies
    for (const a of anomalies) {
      expect(typeof a.z_score).toBe("number")
      expect(Math.abs(a.z_score)).toBeGreaterThan(2.0)
    }
  })
})
