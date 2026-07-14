import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const md = existsSync("output.md") ? readFileSync("output.md", "utf-8") : ""

describe("output.md", () => {
  test("exists", () => {
    expect(existsSync("output.md")).toBe(true)
    expect(md.length).toBeGreaterThan(100)
  })
})

describe("headings", () => {
  test("h1 heading for API Reference", () => {
    expect(md).toMatch(/^# .*(REST API|API Reference)/m)
  })

  test("h2 headings for sections", () => {
    expect(md).toMatch(/^## .*Authentication/m)
    expect(md).toMatch(/^## .*Endpoints/m)
    expect(md).toMatch(/^## .*Rate Limits/m)
  })

  test("h3 headings for endpoints", () => {
    expect(md).toMatch(/^### .*GET \/api\/users/m)
    expect(md).toMatch(/^### .*POST \/api\/users/m)
    expect(md).toMatch(/^### .*DELETE/m)
  })
})

describe("inline formatting", () => {
  test("bold text preserved", () => {
    expect(md).toMatch(/\*\*User Management API\*\*/)
  })

  test("code spans preserved", () => {
    expect(md).toContain("`Authorization`")
    expect(md).toContain("`429`")
  })

  test("italic text preserved", () => {
    expect(md).toMatch(/[*_]name[*_]/)
  })
})

describe("structure", () => {
  test("bullet list items present", () => {
    expect(md).toContain("Default page size: 20")
    expect(md).toContain("Maximum page size: 100")
  })

  test("code block present", () => {
    expect(md).toContain("Bearer")
    // Should be in a code block (indented or fenced)
    const hasCodeBlock = md.includes("```") || md.match(/^ {4}Authorization/m)
    expect(hasCodeBlock).toBeTruthy()
  })
})

describe("table", () => {
  test("table header row exists", () => {
    expect(md).toContain("Field")
    expect(md).toContain("Type")
    expect(md).toContain("Required")
    expect(md).toContain("Description")
  })

  test("table has separator row", () => {
    // Markdown tables have a |---|---| separator
    expect(md).toMatch(/\|[\s-]+\|/)
  })

  test("table has 4 data rows", () => {
    expect(md).toContain("name")
    expect(md).toContain("email")
    expect(md).toContain("role")
    expect(md).toContain("active")
  })
})

describe("links", () => {
  test("mailto link preserved", () => {
    expect(md).toContain("api-support@example.com")
  })

  test("link syntax used", () => {
    // Should have markdown link [text](url) or bare URL
    const hasLink = md.includes("](mailto:") || md.includes("api-support@example.com")
    expect(hasLink).toBeTruthy()
  })
})
