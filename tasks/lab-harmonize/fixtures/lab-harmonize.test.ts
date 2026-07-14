import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? "" })
    return row
  })
}

describe("harmonized_labs.csv", () => {
  test("output exists", () => {
    expect(existsSync("harmonized_labs.csv")).toBe(true)
  })

  test("row count is 20", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    expect(rows.length).toBe(20)
  })

  test("creatinine range: all values 0.2-20.0 mg/dL", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    for (const row of rows) {
      const val = parseFloat(row["Serum_Creatinine"])
      expect(val).toBeGreaterThanOrEqual(0.2)
      expect(val).toBeLessThanOrEqual(20.0)
    }
  })

  test("glucose range: all values 30-500 mg/dL", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    for (const row of rows) {
      const val = parseFloat(row["Glucose"])
      expect(val).toBeGreaterThanOrEqual(30)
      expect(val).toBeLessThanOrEqual(500)
    }
  })

  test("hemoglobin range: all values 3-20 g/dL", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    for (const row of rows) {
      const val = parseFloat(row["Hemoglobin"])
      expect(val).toBeGreaterThanOrEqual(3)
      expect(val).toBeLessThanOrEqual(20)
    }
  })

  test("spot-check P001: creatinine already in mg/dL stays ~1.20", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const p001 = rows.find((r) => r["Patient_ID"] === "P001")
    expect(p001).toBeDefined()
    const val = parseFloat(p001!["Serum_Creatinine"])
    expect(Math.abs(val - 1.20)).toBeLessThan(0.05)
  })

  test("spot-check P011: creatinine converted from 88.4 µmol/L → ~1.00 mg/dL", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const p011 = rows.find((r) => r["Patient_ID"] === "P011")
    expect(p011).toBeDefined()
    // 88.4 * 0.0113 = 0.99892 -> rounds to 1.00
    const val = parseFloat(p011!["Serum_Creatinine"])
    expect(Math.abs(val - 1.00)).toBeLessThan(0.05)
  })

  test("spot-check P013: creatinine converted from 221.0 µmol/L → ~2.50 mg/dL", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const p013 = rows.find((r) => r["Patient_ID"] === "P013")
    expect(p013).toBeDefined()
    // 221.0 * 0.0113 = 2.4973 -> 2.50
    const val = parseFloat(p013!["Serum_Creatinine"])
    expect(Math.abs(val - 2.50)).toBeLessThan(0.05)
  })

  test("spot-check P012: creatinine converted from European decimal 106,1 µmol/L → ~1.20 mg/dL", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const p012 = rows.find((r) => r["Patient_ID"] === "P012")
    expect(p012).toBeDefined()
    // 106.1 * 0.0113 = 1.1989 -> 1.20
    const val = parseFloat(p012!["Serum_Creatinine"])
    expect(Math.abs(val - 1.20)).toBeLessThan(0.05)
  })

  test("spot-check P002: glucose parsed from scientific notation 1.26e2 → 126.00 mg/dL", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const p002 = rows.find((r) => r["Patient_ID"] === "P002")
    expect(p002).toBeDefined()
    // 1.26e2 = 126, already in mg/dL range (30-500), stays 126.00
    const val = parseFloat(p002!["Glucose"])
    expect(Math.abs(val - 126.00)).toBeLessThan(0.5)
  })

  test("spot-check P011: glucose converted from 5.3 mmol/L → ~95.50 mg/dL", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const p011 = rows.find((r) => r["Patient_ID"] === "P011")
    expect(p011).toBeDefined()
    // 5.3 / 0.0555 = 95.50
    const val = parseFloat(p011!["Glucose"])
    expect(Math.abs(val - 95.50)).toBeLessThan(1)
  })

  test("spot-check P013: hemoglobin parsed from scientific notation 1.05e2 g/L → 10.50 g/dL", () => {
    const content = readFileSync("harmonized_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const p013 = rows.find((r) => r["Patient_ID"] === "P013")
    expect(p013).toBeDefined()
    // 1.05e2 = 105 g/L -> 105 * 0.1 = 10.50 g/dL
    const val = parseFloat(p013!["Hemoglobin"])
    expect(Math.abs(val - 10.50)).toBeLessThan(0.05)
  })
})
