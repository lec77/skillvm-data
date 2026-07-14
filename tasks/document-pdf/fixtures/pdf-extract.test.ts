import { describe, test, expect } from "bun:test"
import { readFileSync, existsSync } from "fs"

function loadJSON(file: string): any {
  const raw = readFileSync(file, "utf-8")
  return JSON.parse(raw)
}

describe("pdf_extract.json", () => {
  test("exists and is valid JSON", () => {
    expect(existsSync("pdf_extract.json")).toBe(true)
    const data = loadJSON("pdf_extract.json")
    expect(data).toBeDefined()
  })

  test("regional revenue table has all 4 regions", () => {
    const data = loadJSON("pdf_extract.json")
    // Find regional data - could be nested in various ways
    const json = JSON.stringify(data).toLowerCase()
    expect(json).toContain("north")
    expect(json).toContain("south")
    expect(json).toContain("east")
    expect(json).toContain("west")
  })

  test("North region Q1 revenue is 1250", () => {
    const data = loadJSON("pdf_extract.json")
    const json = JSON.stringify(data)
    // Should contain 1250 (with or without comma formatting)
    expect(json.includes("1250") || json.includes("1,250")).toBe(true)
  })

  test("Total YTD revenue is 18160", () => {
    const data = loadJSON("pdf_extract.json")
    const json = JSON.stringify(data)
    expect(json.includes("18160") || json.includes("18,160")).toBe(true)
  })

  test("product breakdown has 4 products", () => {
    const data = loadJSON("pdf_extract.json")
    const json = JSON.stringify(data).toLowerCase()
    expect(json).toContain("core platform")
    expect(json).toContain("enterprise")
    expect(json).toContain("new product")
    expect(json).toContain("services")
  })

  test("West region YTD is 6350", () => {
    const data = loadJSON("pdf_extract.json")
    const json = JSON.stringify(data)
    expect(json.includes("6350") || json.includes("6,350")).toBe(true)
  })
})

describe("summary.md", () => {
  test("exists and contains markdown table", () => {
    expect(existsSync("summary.md")).toBe(true)
    const content = readFileSync("summary.md", "utf-8")
    // Markdown tables use | character
    expect(content).toContain("|")
    // Should mention key findings
    const lower = content.toLowerCase()
    expect(lower.includes("region") || lower.includes("revenue") || lower.includes("sales")).toBe(true)
  })
})
