import { describe, test, expect } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("bar-chart", () => {
  test("chart.html exists", () => {
    expect(existsSync("chart.html")).toBe(true)
  })

  test("contains SVG element", () => {
    const html = readFileSync("chart.html", "utf-8")
    expect(html).toContain("<svg")
  })

  test("has 8 bars for 8 products", () => {
    const html = readFileSync("chart.html", "utf-8")
    const rectCount = (html.match(/<rect/g) || []).length
    expect(rectCount).toBeGreaterThanOrEqual(8)
  })

  test("no CDN URLs", () => {
    const html = readFileSync("chart.html", "utf-8")
    expect(html).not.toContain("cdn.jsdelivr.net")
    expect(html).not.toContain("cdnjs.cloudflare.com")
    expect(html).not.toContain("unpkg.com")
  })

  test("contains axis labels", () => {
    const html = readFileSync("chart.html", "utf-8")
    expect(html).toContain("Revenue")
  })

  test("contains product names", () => {
    const html = readFileSync("chart.html", "utf-8")
    expect(html).toContain("Widgets")
    expect(html).toContain("Thingamajigs")
  })
})
