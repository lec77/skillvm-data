import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const rewritten = existsSync("rewritten.txt") ? readFileSync("rewritten.txt", "utf-8") : ""
const summary = existsSync("changes_summary.json") ? JSON.parse(readFileSync("changes_summary.json", "utf-8")) : {}
const lower = rewritten.toLowerCase()

describe("output files", () => {
  test("rewritten.txt exists", () => {
    expect(existsSync("rewritten.txt")).toBe(true)
    expect(rewritten.length).toBeGreaterThan(50)
  })

  test("changes_summary.json exists", () => {
    expect(existsSync("changes_summary.json")).toBe(true)
  })
})

describe("AI patterns removed", () => {
  test("no filler phrases remain", () => {
    expect(lower).not.toContain("it's important to note")
    expect(lower).not.toContain("furthermore")
    expect(lower).not.toContain("it is worth noting")
  })

  test("no buzzword 'leveraging'", () => {
    expect(lower).not.toContain("leveraging")
  })

  test("no buzzword 'paramount'", () => {
    expect(lower).not.toContain("paramount")
  })

  test("no 'delving' present", () => {
    expect(lower).not.toContain("delving")
  })

  test("no 'holistic' or 'multifaceted' or 'nuanced'", () => {
    expect(lower).not.toContain("holistic")
    expect(lower).not.toContain("multifaceted")
    expect(lower).not.toContain("nuanced")
  })
})

describe("meaning preserved", () => {
  test("mentions remote work", () => {
    expect(lower).toContain("remote")
  })

  test("mentions communication or collaboration", () => {
    const hasTopic = lower.includes("communication") || lower.includes("collaboration") || lower.includes("collaborate")
    expect(hasTopic).toBe(true)
  })

  test("mentions team", () => {
    expect(lower).toContain("team")
  })
})

describe("length check", () => {
  // Original is about 100 words
  const wordCount = rewritten.split(/\s+/).filter(w => w.length > 0).length

  test("word count within range", () => {
    expect(wordCount).toBeGreaterThan(0)
  })

  test("not too short (at least 50 words)", () => {
    expect(wordCount).toBeGreaterThanOrEqual(50)
  })

  test("not too long (at most 200 words)", () => {
    expect(wordCount).toBeLessThanOrEqual(200)
  })
})

describe("changes summary", () => {
  test("original_word_count is reasonable", () => {
    expect(summary.original_word_count).toBeGreaterThan(80)
    expect(summary.original_word_count).toBeLessThan(130)
  })

  test("patterns_removed list has entries", () => {
    expect(Array.isArray(summary.patterns_removed)).toBe(true)
    expect(summary.patterns_removed.length).toBeGreaterThanOrEqual(5)
  })

  test("readability_improved is true", () => {
    expect(summary.readability_improved).toBe(true)
  })
})
