import { describe, test, expect } from "bun:test"
import { existsSync } from "fs"
import { execSync } from "child_process"
import path from "path"

function getVerification(): any {
  const python = process.env.EVAL_PYTHON || "python3"
  const scriptPath = path.join(import.meta.dirname, "verify_sales_report.py")
  const output = execSync(`${python} ${scriptPath} sales_report.xlsx`, {
    encoding: "utf-8",
    timeout: 15000,
  })
  return JSON.parse(output)
}

describe("sales_report.xlsx", () => {
  test("exists and is a valid xlsx file", () => {
    expect(existsSync("sales_report.xlsx")).toBe(true)
    const v = getVerification()
    expect(v.valid).toBe(true)
  })

  test("has all 5 product lines", () => {
    const v = getVerification()
    expect(v.product_lines).toContain("widgets")
    expect(v.product_lines).toContain("gadgets")
    expect(v.product_lines).toContain("services")
    expect(v.product_lines).toContain("licenses")
    expect(v.product_lines).toContain("support")
  })

  test("has Q1 through Q4 columns", () => {
    const v = getVerification()
    expect(v.quarter_headers).toContain("q1")
    expect(v.quarter_headers).toContain("q2")
    expect(v.quarter_headers).toContain("q3")
    expect(v.quarter_headers).toContain("q4")
  })

  test("revenue values are present and correct", () => {
    const v = getVerification()
    // Check at least 15 of 20 expected values are present (tolerance for formatting differences)
    expect(v.revenue_values.length).toBeGreaterThanOrEqual(15)
  })

  test("contains SUM formulas for totals", () => {
    const v = getVerification()
    expect(v.sum_formulas.length).toBeGreaterThanOrEqual(1)
  })

  test("contains AVERAGE formulas", () => {
    const v = getVerification()
    expect(v.average_formulas.length).toBeGreaterThanOrEqual(1)
  })

  test("has red conditional formatting or red fill on low-value cells", () => {
    const v = getVerification()
    expect(v.has_conditional_formatting || v.has_red_formatting).toBe(true)
  })
})
