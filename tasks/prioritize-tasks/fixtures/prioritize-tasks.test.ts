import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const data = existsSync("priority_report.json") ? JSON.parse(readFileSync("priority_report.json", "utf-8")) : {}

describe("priority_report.json", () => {
  test("exists", () => {
    expect(existsSync("priority_report.json")).toBe(true)
  })
})

describe("must_do_today", () => {
  // Deadline=2026-03-16 (today) AND impact=high: Submit tax forms, Fix production bug, Schedule dentist appointment
  test("must_do_today is an array", () => {
    expect(data.must_do_today).toBeArray()
  })

  test("must_do_today contains Submit tax forms", () => {
    expect(data.must_do_today).toContain("Submit tax forms")
  })

  test("must_do_today contains Fix production bug", () => {
    expect(data.must_do_today).toContain("Fix production bug")
  })

  test("must_do_today contains Schedule dentist appointment", () => {
    expect(data.must_do_today).toContain("Schedule dentist appointment")
  })
})

describe("deferred", () => {
  // Deadline=2026-03-22 (next week) AND impact=low: Organize garage, Update LinkedIn profile, Clean email inbox
  test("deferred is an array", () => {
    expect(data.deferred).toBeArray()
  })

  test("deferred contains Organize garage", () => {
    expect(data.deferred).toContain("Organize garage")
  })

  test("deferred contains Update LinkedIn profile", () => {
    expect(data.deferred).toContain("Update LinkedIn profile")
  })

  test("deferred contains Clean email inbox", () => {
    expect(data.deferred).toContain("Clean email inbox")
  })
})

describe("completeness", () => {
  const allTaskNames = [
    "Submit tax forms", "Fix production bug", "Schedule dentist appointment",
    "Write blog post draft", "Grocery shopping", "Review team proposals",
    "Organize garage", "Update LinkedIn profile", "Plan team offsite",
    "Morning jog routine", "Clean email inbox", "Prepare quarterly budget"
  ]

  test("all 12 tasks categorized across the four arrays", () => {
    const allCategorized = [
      ...(data.must_do_today || []),
      ...(data.should_do || []),
      ...(data.nice_to_have || []),
      ...(data.deferred || []),
    ]
    for (const name of allTaskNames) {
      expect(allCategorized).toContain(name)
    }
  })

  test("exactly 12 tasks total across arrays", () => {
    const total = (data.must_do_today?.length || 0)
      + (data.should_do?.length || 0)
      + (data.nice_to_have?.length || 0)
      + (data.deferred?.length || 0)
    expect(total).toBe(12)
  })
})

describe("reasoning", () => {
  test("reasoning is an object", () => {
    expect(typeof data.reasoning).toBe("object")
  })

  test("reasoning has entries for all 12 tasks", () => {
    const keys = Object.keys(data.reasoning || {})
    expect(keys.length).toBe(12)
  })

  test("reasoning values are non-empty strings", () => {
    for (const [, value] of Object.entries(data.reasoning || {})) {
      expect(typeof value).toBe("string")
      expect((value as string).length).toBeGreaterThan(0)
    }
  })
})
