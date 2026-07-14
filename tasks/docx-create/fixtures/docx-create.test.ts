import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const text = existsSync("report_text.txt") ? readFileSync("report_text.txt", "utf-8") : ""

describe("files", () => {
  test("report.docx exists", () => {
    expect(existsSync("report.docx")).toBe(true)
  })

  test("report_text.txt exists", () => {
    expect(existsSync("report_text.txt")).toBe(true)
    expect(text.length).toBeGreaterThan(50)
  })
})

describe("headings", () => {
  test("title heading present", () => {
    expect(text).toContain("Q1 Project Status Report")
  })

  test("Team Members heading present", () => {
    expect(text).toContain("Team Members")
  })

  test("Milestones heading present", () => {
    expect(text).toContain("Milestones")
  })
})

describe("body content", () => {
  test("Engineering department mentioned", () => {
    expect(text).toContain("Engineering department")
  })

  test("period text present", () => {
    expect(text).toContain("January")
    expect(text).toContain("March 2026")
  })
})

describe("team members", () => {
  test("Alice Chen listed", () => {
    expect(text).toContain("Alice Chen")
  })

  test("Bob Park listed", () => {
    expect(text).toContain("Bob Park")
  })

  test("Carol Kim listed", () => {
    expect(text).toContain("Carol Kim")
  })

  test("Dave Lee listed", () => {
    expect(text).toContain("Dave Lee")
  })
})

describe("milestone table", () => {
  test("Design Complete row present", () => {
    expect(text).toContain("Design Complete")
    expect(text).toContain("2026-01-15")
  })

  test("Backend API row present", () => {
    expect(text).toContain("Backend API")
    expect(text).toContain("2026-02-10")
  })

  test("Frontend UI row present", () => {
    expect(text).toContain("Frontend UI")
    expect(text).toContain("In Progress")
  })

  test("Testing row present", () => {
    expect(text).toContain("Testing")
    expect(text).toContain("Planned")
    expect(text).toContain("2026-03-20")
  })
})
