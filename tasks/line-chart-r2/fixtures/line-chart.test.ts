import { describe, test, expect } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("line-chart", () => {
  test("chart.html exists", () => {
    expect(existsSync("chart.html")).toBe(true)
  })

  test("contains SVG element", () => {
    const html = readFileSync("chart.html", "utf-8")
    expect(html).toContain("<svg")
  })

  test("contains path element for the line", () => {
    const html = readFileSync("chart.html", "utf-8")
    expect(html.toLowerCase()).toContain("<path")
  })

  test("no CDN URLs", () => {
    const html = readFileSync("chart.html", "utf-8")
    expect(html).not.toContain("cdn.jsdelivr.net")
    expect(html).not.toContain("cdnjs.cloudflare.com")
    expect(html).not.toContain("unpkg.com")
  })

  test("contains date formatting", () => {
    const html = readFileSync("chart.html", "utf-8")
    expect(html).toContain("2026")
  })

  test("contains chart title", () => {
    const html = readFileSync("chart.html", "utf-8")
    expect(html).toContain("Trend")
  })
})
