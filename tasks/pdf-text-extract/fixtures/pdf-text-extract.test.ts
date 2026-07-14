import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const data = existsSync("report_data.json") ? JSON.parse(readFileSync("report_data.json", "utf-8")) : {}

describe("report_data.json", () => {
  test("exists", () => {
    expect(existsSync("report_data.json")).toBe(true)
  })
})

describe("metadata", () => {
  test("title contains Quarterly Sales Report", () => {
    expect(data.title).toContain("Quarterly Sales Report")
  })

  test("period is Q4 2025", () => {
    expect(data.period).toContain("Q4 2025")
  })

  test("total_pages is 2", () => {
    expect(data.total_pages).toBe(2)
  })
})

describe("financials", () => {
  test("total_revenue is 2450000", () => {
    expect(Math.abs(data.financials.total_revenue - 2450000)).toBeLessThan(1000)
  })

  test("operating_expenses is 1820000", () => {
    expect(Math.abs(data.financials.operating_expenses - 1820000)).toBeLessThan(1000)
  })

  test("net_profit is 630000", () => {
    expect(Math.abs(data.financials.net_profit - 630000)).toBeLessThan(1000)
  })

  test("profit_margin is 25.7", () => {
    expect(Math.abs(data.financials.profit_margin - 25.7)).toBeLessThan(1)
  })
})

describe("highlights", () => {
  test("has highlights array", () => {
    expect(Array.isArray(data.highlights)).toBe(true)
    expect(data.highlights.length).toBeGreaterThanOrEqual(3)
  })

  test("North region growth mentioned", () => {
    const all = data.highlights.join(" ").toLowerCase()
    expect(all).toContain("north")
  })

  test("retention rate mentioned", () => {
    const all = data.highlights.join(" ").toLowerCase()
    expect(all).toContain("retention") || expect(all).toContain("94%")
  })
})

describe("regions", () => {
  test("has 4 regions", () => {
    expect(data.regions).toBeArrayOfSize(4)
  })

  test("North revenue is 820000", () => {
    const north = data.regions.find((r: any) => r.name === "North")
    expect(north).toBeDefined()
    expect(Math.abs(north.revenue - 820000)).toBeLessThan(1000)
  })

  test("South revenue is 610000", () => {
    const south = data.regions.find((r: any) => r.name === "South")
    expect(south).toBeDefined()
    expect(Math.abs(south.revenue - 610000)).toBeLessThan(1000)
  })

  test("growth percentages are numbers", () => {
    for (const region of data.regions) {
      expect(typeof region.growth).toBe("number")
      expect(region.growth).toBeGreaterThan(0)
    }
  })
})
