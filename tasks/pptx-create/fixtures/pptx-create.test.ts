import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const text = existsSync("pitch_text.txt") ? readFileSync("pitch_text.txt", "utf-8") : ""

describe("files", () => {
  test("pitch.pptx exists", () => {
    expect(existsSync("pitch.pptx")).toBe(true)
  })

  test("pitch_text.txt exists", () => {
    expect(existsSync("pitch_text.txt")).toBe(true)
    expect(text.length).toBeGreaterThan(50)
  })
})

describe("title slide", () => {
  test("TechStart 2026 title present", () => {
    expect(text).toContain("TechStart 2026")
  })

  test("Investor Pitch Deck subtitle present", () => {
    expect(text).toContain("Investor Pitch Deck")
  })
})

describe("problem slide", () => {
  test("The Problem heading present", () => {
    expect(text).toContain("The Problem")
  })

  test("data entry cost mentioned", () => {
    expect(text).toContain("4.2B")
  })

  test("error rate mentioned", () => {
    expect(text).toContain("15%")
  })

  test("employees time mentioned", () => {
    expect(text).toContain("2+ hours")
  })
})

describe("solution slide", () => {
  test("Our Solution heading present", () => {
    expect(text).toContain("Our Solution")
  })

  test("AI-powered mentioned", () => {
    expect(text).toContain("AI-powered")
  })

  test("accuracy rate mentioned", () => {
    expect(text).toContain("99.5%")
  })

  test("processing time mentioned", () => {
    expect(text).toContain("80%")
  })
})

describe("team slide", () => {
  test("Our Team heading present", () => {
    expect(text).toContain("Our Team")
  })

  test("Jane Smith listed", () => {
    expect(text).toContain("Jane Smith")
  })

  test("Mike Johnson listed", () => {
    expect(text).toContain("Mike Johnson")
  })

  test("Sarah Lee listed", () => {
    expect(text).toContain("Sarah Lee")
  })

  test("Tom Brown listed", () => {
    expect(text).toContain("Tom Brown")
  })
})
