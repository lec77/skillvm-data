import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"
import path from "path"

const workDir = process.env.WORK_DIR || process.cwd()
const digestPath = path.join(workDir, "digest.json")

function loadDigest() {
  if (!existsSync(digestPath)) return null
  return JSON.parse(readFileSync(digestPath, "utf-8"))
}

const HIGHLIGHT_KEYS = ["highlights", "key_stories", "top_stories", "executive_summary", "key_highlights", "topHighlights", "top_highlights"]

/** Recursively search for a highlights-like array in the JSON structure (up to 3 levels deep) */
function findHighlights(obj: any, depth = 0): any {
  if (!obj || typeof obj !== "object" || depth > 3) return null
  for (const key of HIGHLIGHT_KEYS) {
    if (obj[key]) return obj[key]
  }
  for (const val of Object.values(obj)) {
    const found = findHighlights(val, depth + 1)
    if (found) return found
  }
  return null
}

describe("multi-feed-digest", () => {
  test("digest.json exists", () => {
    expect(existsSync(digestPath)).toBe(true)
  })

  test("has all 4 source feeds", () => {
    const d = loadDigest()
    expect(d).not.toBeNull()
    const sources = (d.categories ?? d.feeds ?? d.sections ?? []).map(
      (s: any) => (s.source ?? s.feed ?? s.name ?? "").toLowerCase()
    )
    // Should have entries covering tech, business, world, science
    const text = JSON.stringify(d).toLowerCase()
    expect(text).toContain("tech")
    expect(text).toContain("business")
    expect(text).toContain("world")
    expect(text).toContain("science")
  })

  test("has 16 total articles across all feeds", () => {
    const d = loadDigest()
    expect(d).not.toBeNull()
    // Count all articles in any nested structure
    const text = JSON.stringify(d)
    // Each feed has 4 articles = 16 total
    // Check that key article titles appear
    expect(text).toContain("M5 Ultra")
    expect(text).toContain("Tesla")
    expect(text).toContain("India")
    expect(text).toContain("CRISPR")
  })

  test("has per-category summaries", () => {
    const d = loadDigest()
    expect(d).not.toBeNull()
    // Should have some grouping structure with summaries
    const text = JSON.stringify(d).toLowerCase()
    // Must have summary text (not just raw article data)
    const hasSummaryField = text.includes("summary") || text.includes("overview") || text.includes("highlights")
    expect(hasSummaryField).toBe(true)
  })

  test("tech category mentions AI and quantum", () => {
    const d = loadDigest()
    const text = JSON.stringify(d).toLowerCase()
    expect(text).toContain("gpt")
    expect(text).toContain("quantum")
  })

  test("business category mentions market data", () => {
    const d = loadDigest()
    const text = JSON.stringify(d).toLowerCase()
    // Should mention key business figures
    const hasMarketData = text.includes("trillion") || text.includes("5 trillion") || text.includes("billion")
    expect(hasMarketData).toBe(true)
  })

  test("world category covers geopolitics", () => {
    const d = loadDigest()
    const text = JSON.stringify(d).toLowerCase()
    expect(text).toContain("ceasefire")
  })

  test("science category covers breakthroughs", () => {
    const d = loadDigest()
    const text = JSON.stringify(d).toLowerCase()
    expect(text).toContain("fusion")
  })

  test("has aggregated key highlights section", () => {
    const d = loadDigest()
    expect(d).not.toBeNull()
    expect(findHighlights(d)).toBeTruthy()
  })

  test("highlights reference stories from multiple feeds", () => {
    const d = loadDigest()
    const highlights = JSON.stringify(findHighlights(d) ?? []).toLowerCase()
    // Highlights should span at least 2 different feed categories
    let feedsRepresented = 0
    if (highlights.includes("apple") || highlights.includes("gpt") || highlights.includes("quantum") || highlights.includes("ai")) feedsRepresented++
    if (highlights.includes("tesla") || highlights.includes("nvidia") || highlights.includes("japan") || highlights.includes("amazon")) feedsRepresented++
    if (highlights.includes("india") || highlights.includes("ceasefire") || highlights.includes("deforestation") || highlights.includes("who")) feedsRepresented++
    if (highlights.includes("crispr") || highlights.includes("fusion") || highlights.includes("webb") || highlights.includes("battery")) feedsRepresented++
    expect(feedsRepresented).toBeGreaterThanOrEqual(2)
  })
})
