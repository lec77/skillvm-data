import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n")
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? "" })
    return row
  })
}

describe("output exists", () => {
  test("quality_report.json exists", () => {
    expect(existsSync("quality_report.json")).toBe(true)
  })

  test("cleaned_labs.csv exists", () => {
    expect(existsSync("cleaned_labs.csv")).toBe(true)
  })

  test("quality_report.json is valid JSON", () => {
    const content = readFileSync("quality_report.json", "utf-8")
    expect(() => JSON.parse(content)).not.toThrow()
  })
})

describe("report structure", () => {
  test("quality_report.json has required fields", () => {
    const report = JSON.parse(readFileSync("quality_report.json", "utf-8"))
    expect(report).toHaveProperty("total_rows")
    expect(report).toHaveProperty("excluded_rows")
    expect(report).toHaveProperty("issues_found")
  })

  test("total_rows is 30", () => {
    const report = JSON.parse(readFileSync("quality_report.json", "utf-8"))
    expect(Number(report.total_rows)).toBe(30)
  })

  test("issues_found has mixed_units, scientific_notation, european_decimal, whitespace keys", () => {
    const report = JSON.parse(readFileSync("quality_report.json", "utf-8"))
    const issues = report.issues_found
    expect(issues).toHaveProperty("mixed_units")
    expect(issues).toHaveProperty("scientific_notation")
    expect(issues).toHaveProperty("european_decimal")
    expect(issues).toHaveProperty("whitespace")
  })
})

describe("excluded rows", () => {
  test("excluded_rows is 3", () => {
    const report = JSON.parse(readFileSync("quality_report.json", "utf-8"))
    expect(Number(report.excluded_rows)).toBe(3)
  })
})

describe("cleaned rows", () => {
  test("cleaned_labs.csv has exactly 27 data rows", () => {
    const content = readFileSync("cleaned_labs.csv", "utf-8")
    const rows = parseCSV(content)
    expect(rows.length).toBe(27)
  })

  test("cleaned_labs.csv does not contain P010, P020, or P030", () => {
    const content = readFileSync("cleaned_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const ids = rows.map((r) => r["Patient_ID"])
    expect(ids).not.toContain("P010")
    expect(ids).not.toContain("P020")
    expect(ids).not.toContain("P030")
  })
})

describe("issue counts", () => {
  test("mixed_units count is greater than 5", () => {
    const report = JSON.parse(readFileSync("quality_report.json", "utf-8"))
    // Dataset has ~10+ out-of-range values needing conversion
    expect(Number(report.issues_found.mixed_units)).toBeGreaterThan(5)
  })

  test("scientific_notation count is at least 2", () => {
    const report = JSON.parse(readFileSync("quality_report.json", "utf-8"))
    // P008 (1.5e0), P009 (1.80e2), P013 (1.42e2), P025 (1.15e2) = 4 values
    expect(Number(report.issues_found.scientific_notation)).toBeGreaterThanOrEqual(2)
  })

  test("european_decimal count is at least 2", () => {
    const report = JSON.parse(readFileSync("quality_report.json", "utf-8"))
    // P011 (88,4), P012 (7,0), P027 (2,24), P029 (79,6) = 4 values
    expect(Number(report.issues_found.european_decimal)).toBeGreaterThanOrEqual(2)
  })

  test("whitespace count is at least 1", () => {
    const report = JSON.parse(readFileSync("quality_report.json", "utf-8"))
    // P015, P019, P023 = 3 values with whitespace
    expect(Number(report.issues_found.whitespace)).toBeGreaterThanOrEqual(1)
  })
})

describe("values in range", () => {
  test("all Serum_Creatinine values in cleaned_labs.csv are 0.2-20.0 mg/dL", () => {
    const content = readFileSync("cleaned_labs.csv", "utf-8")
    const rows = parseCSV(content)
    for (const row of rows) {
      const val = parseFloat(row["Serum_Creatinine"])
      if (!isNaN(val)) {
        expect(val).toBeGreaterThanOrEqual(0.2)
        expect(val).toBeLessThanOrEqual(20.0)
      }
    }
  })

  test("all Glucose values in cleaned_labs.csv are 30-500 mg/dL", () => {
    const content = readFileSync("cleaned_labs.csv", "utf-8")
    const rows = parseCSV(content)
    for (const row of rows) {
      const val = parseFloat(row["Glucose"])
      if (!isNaN(val)) {
        expect(val).toBeGreaterThanOrEqual(30)
        expect(val).toBeLessThanOrEqual(500)
      }
    }
  })

  test("all Hemoglobin values in cleaned_labs.csv are 3-20 g/dL", () => {
    const content = readFileSync("cleaned_labs.csv", "utf-8")
    const rows = parseCSV(content)
    for (const row of rows) {
      const val = parseFloat(row["Hemoglobin"])
      if (!isNaN(val)) {
        expect(val).toBeGreaterThanOrEqual(3)
        expect(val).toBeLessThanOrEqual(20)
      }
    }
  })

  test("all Total_Cholesterol values in cleaned_labs.csv are 50-400 mg/dL", () => {
    const content = readFileSync("cleaned_labs.csv", "utf-8")
    const rows = parseCSV(content)
    for (const row of rows) {
      const val = parseFloat(row["Total_Cholesterol"])
      if (!isNaN(val)) {
        expect(val).toBeGreaterThanOrEqual(50)
        expect(val).toBeLessThanOrEqual(400)
      }
    }
  })

  test("all Calcium values in cleaned_labs.csv are 4-15 mg/dL", () => {
    const content = readFileSync("cleaned_labs.csv", "utf-8")
    const rows = parseCSV(content)
    for (const row of rows) {
      const val = parseFloat(row["Calcium"])
      if (!isNaN(val)) {
        expect(val).toBeGreaterThanOrEqual(4)
        expect(val).toBeLessThanOrEqual(15)
      }
    }
  })

  test("spot-check P002: creatinine converted from 97.0 µmol/L → ~1.10 mg/dL", () => {
    const content = readFileSync("cleaned_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const p002 = rows.find((r) => r["Patient_ID"] === "P002")
    expect(p002).toBeDefined()
    // 97.0 * 0.0113 = 1.0961 -> 1.10
    const val = parseFloat(p002!["Serum_Creatinine"])
    expect(Math.abs(val - 1.10)).toBeLessThan(0.1)
  })

  test("spot-check P004: hemoglobin converted from 135 g/L → 13.5 g/dL", () => {
    const content = readFileSync("cleaned_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const p004 = rows.find((r) => r["Patient_ID"] === "P004")
    expect(p004).toBeDefined()
    // 135 * 0.1 = 13.5
    const val = parseFloat(p004!["Hemoglobin"])
    expect(Math.abs(val - 13.5)).toBeLessThan(0.1)
  })

  test("spot-check P005: cholesterol converted from 5.18 mmol/L → ~200 mg/dL", () => {
    const content = readFileSync("cleaned_labs.csv", "utf-8")
    const rows = parseCSV(content)
    const p005 = rows.find((r) => r["Patient_ID"] === "P005")
    expect(p005).toBeDefined()
    // 5.18 / 0.0259 = 200.0
    const val = parseFloat(p005!["Total_Cholesterol"])
    expect(Math.abs(val - 200.0)).toBeLessThan(1)
  })
})
