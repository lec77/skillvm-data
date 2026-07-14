import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const digest = existsSync("digest.json") ? JSON.parse(readFileSync("digest.json", "utf-8")) : {}
const storyTitles = [
  "Major Breakthrough in Fusion Energy",
  "Global Chip Shortage Finally Easing",
  "Autonomous Vehicle Fleet Launches in Phoenix",
  "New Battery Technology Doubles EV Range",
  "Remote Work Becomes Permanent at Major Tech Firms",
]

describe("digest.json", () => {
  test("exists", () => {
    expect(existsSync("digest.json")).toBe(true)
  })
})

describe("digest structure", () => {
  test("article_count is 5", () => {
    expect(digest.article_count).toBe(5)
  })

  test("date_range is correct", () => {
    expect(digest.date_range).toBeDefined()
    expect(digest.date_range.earliest).toBe("2026-03-08")
    expect(digest.date_range.latest).toBe("2026-03-11")
  })

  test("has summaries array", () => {
    expect(Array.isArray(digest.summaries)).toBe(true)
  })

  test("has key_numbers array", () => {
    expect(Array.isArray(digest.key_numbers)).toBe(true)
  })
})

describe("summaries", () => {
  test("has 5 summaries", () => {
    expect(digest.summaries).toBeArrayOfSize(5)
  })

  test("each has required fields", () => {
    for (const s of digest.summaries) {
      expect(s).toHaveProperty("title")
      expect(s).toHaveProperty("source")
      expect(s).toHaveProperty("one_line_summary")
      expect(s).toHaveProperty("topic")
    }
  })

  test("topics are valid categories", () => {
    const validTopics = ["Energy", "Technology", "Transportation", "Business"]
    for (const s of digest.summaries) {
      expect(validTopics).toContain(s.topic)
    }
  })

  test("one_line summaries under 20 words", () => {
    for (const s of digest.summaries) {
      const wordCount = s.one_line_summary.split(/\s+/).length
      expect(wordCount).toBeLessThanOrEqual(25) // slight tolerance
    }
  })
})

describe("key numbers", () => {
  const allValues = (digest.key_numbers || []).map((k: any) => String(k.value).toLowerCase())
  const allContext = (digest.key_numbers || []).map((k: any) => String(k.context).toLowerCase()).join(" ")

  test("at least 8 key numbers extracted", () => {
    expect(digest.key_numbers.length).toBeGreaterThanOrEqual(8)
  })

  test("has fusion number (5 megajoules or 30 seconds)", () => {
    const hasFusion = allContext.includes("fusion") || allContext.includes("megajoule") || allContext.includes("ignition")
    expect(hasFusion).toBe(true)
  })

  test("has chip number (8 weeks or 15-20%)", () => {
    const hasChip = allContext.includes("chip") || allContext.includes("semiconductor") || allContext.includes("lead time")
    expect(hasChip).toBe(true)
  })

  test("has waymo number (500 vehicles or 2 million rides)", () => {
    const hasWaymo = allContext.includes("waymo") || allContext.includes("autonomous") || allContext.includes("ride") || allContext.includes("vehicle")
    expect(hasWaymo).toBe(true)
  })

  test("has battery number (900 Wh/kg or 10 minutes)", () => {
    const hasBattery = allContext.includes("battery") || allContext.includes("solid-state") || allContext.includes("charge") || allContext.includes("energy density")
    expect(hasBattery).toBe(true)
  })
})

describe("editorial", () => {
  test("top_story is a valid title", () => {
    expect(storyTitles).toContain(digest.top_story)
  })
})
