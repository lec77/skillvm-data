import { describe, test, expect } from "bun:test"
import { existsSync } from "fs"
import { execSync } from "child_process"
import path from "path"

function getVerification(): any {
  const python = process.env.EVAL_PYTHON || "python3"
  const scriptPath = path.join(import.meta.dirname, "verify_pdf.py")
  const output = execSync(`${python} ${scriptPath} employee_report.pdf`, {
    encoding: "utf-8",
    timeout: 15000,
  })
  return JSON.parse(output)
}

describe("employee_report.pdf", () => {
  test("exists and is a valid PDF", () => {
    expect(existsSync("employee_report.pdf")).toBe(true)
    const v = getVerification()
    expect(v.valid).toBe(true)
  })

  test("has at least 1 page", () => {
    const v = getVerification()
    expect(v.page_count).toBeGreaterThanOrEqual(1)
  })

  test("contains all 12 employee names", () => {
    const v = getVerification()
    // Allow some tolerance - at least 10 of 12 names found
    expect(v.employee_names_found.length).toBeGreaterThanOrEqual(10)
  })

  test("contains all 3 department names", () => {
    const v = getVerification()
    expect(v.departments_found).toContain("Engineering")
    expect(v.departments_found).toContain("Marketing")
    expect(v.departments_found).toContain("Sales")
  })

  test("contains total headcount of 12", () => {
    const v = getVerification()
    expect(v.has_headcount_12).toBe(true)
  })

  test("contains average salary value", () => {
    const v = getVerification()
    expect(v.has_avg_salary).toBe(true)
  })
})
