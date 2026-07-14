import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("data cleaning outputs", () => {
  test("files exist", () => {
    expect(existsSync("cleaned_data.csv")).toBe(true)
    expect(existsSync("cleaning_report.json")).toBe(true)
  })

  test("cleaned CSV has correct row count after dedup (12 unique rows)", () => {
    const lines = readFileSync("cleaned_data.csv", "utf-8").trim().split("\n")
    // 1 header + 12 data rows = 13 lines
    expect(lines.length).toBe(13)
  })

  test("no duplicates remain in cleaned CSV", () => {
    const lines = readFileSync("cleaned_data.csv", "utf-8").trim().split("\n")
    const dataRows = lines.slice(1) // skip header
    const unique = new Set(dataRows)
    expect(unique.size).toBe(dataRows.length)
  })

  test("all dates standardized to YYYY-MM-DD format", () => {
    const lines = readFileSync("cleaned_data.csv", "utf-8").trim().split("\n")
    const header = lines[0].split(",")
    const dateIdx = header.findIndex(h => h.trim().toLowerCase().includes("signup_date"))
    expect(dateIdx).toBeGreaterThanOrEqual(0)

    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",")
      const dateVal = cols[dateIdx]?.trim()
      // Skip empty/missing dates
      if (dateVal && dateVal.length > 0) {
        expect(dateVal).toMatch(datePattern)
      }
    }
  })

  test("report counts for duplicates_removed and invalid_emails", () => {
    const report = JSON.parse(readFileSync("cleaning_report.json", "utf-8"))

    // 3 duplicate rows: Alice (row 4), Bob (row 8), Diana (row 14)
    expect(report.duplicates_removed).toBeDefined()
    expect(report.duplicates_removed).toBe(3)

    // 2 invalid emails before dedup: charlie@example, ivy@example
    expect(report.invalid_emails).toBeDefined()
    expect(report.invalid_emails).toBe(2)
  })

  test("report counts for missing_values and dates_standardized", () => {
    const report = JSON.parse(readFileSync("cleaning_report.json", "utf-8"))

    // 4 missing values before dedup: Diana phone, Frank revenue, Grace email, Jack signup_date
    expect(report.missing_values).toBeDefined()
    expect(Math.abs(report.missing_values - 4)).toBeLessThanOrEqual(1)

    // 5 dates needing standardization before dedup:
    // Bob "01/20/2026", Diana "02-05-2026", Eve "2026/02/10", Grace "March 3 2026", Leo "04/12/2026"
    expect(report.dates_standardized).toBeDefined()
    expect(Math.abs(report.dates_standardized - 5)).toBeLessThanOrEqual(1)
  })
})
