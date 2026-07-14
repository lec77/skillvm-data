import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("sales_analysis.json", () => {
  test("sales_analysis.json exists and is valid JSON", () => {
    expect(existsSync("sales_analysis.json")).toBe(true)
    const raw = readFileSync("sales_analysis.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("total_revenue is 66030 after dedup", () => {
    const report = JSON.parse(readFileSync("sales_analysis.json", "utf-8"))
    expect(report.total_revenue).toBeDefined()
    expect(Math.abs(Number(report.total_revenue) - 66030)).toBeLessThan(1)
  })
})

describe("inventory_analysis.json", () => {
  test("inventory_analysis.json exists and is valid JSON", () => {
    expect(existsSync("inventory_analysis.json")).toBe(true)
    const raw = readFileSync("inventory_analysis.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("low_stock items are correctly identified", () => {
    const report = JSON.parse(readFileSync("inventory_analysis.json", "utf-8"))
    const items = report.low_stock_items
    expect(items).toBeDefined()
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBe(3)
    // Extract SKU strings whether items are strings or objects
    const skus = items.map((item: any) =>
      typeof item === "string" ? item : (item.sku || item.SKU || item.id || "")
    )
    expect(skus.sort()).toEqual(["SKU005", "SKU011", "SKU017"])
  })
})

describe("customers_analysis.json", () => {
  test("customers_analysis.json exists and is valid JSON", () => {
    expect(existsSync("customers_analysis.json")).toBe(true)
    const raw = readFileSync("customers_analysis.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("churn_count is 7", () => {
    const report = JSON.parse(readFileSync("customers_analysis.json", "utf-8"))
    expect(report.churn_count).toBeDefined()
    expect(Number(report.churn_count)).toBe(7)
  })
})

describe("report.json", () => {
  test("report.json exists and is valid JSON", () => {
    expect(existsSync("report.json")).toBe(true)
    const raw = readFileSync("report.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("cross-dataset references from all three sources", () => {
    const report = JSON.parse(readFileSync("report.json", "utf-8"))
    const str = JSON.stringify(report).toLowerCase()
    // Must reference concepts from all three datasets
    expect(str.includes("sales") || str.includes("revenue")).toBe(true)
    expect(str.includes("inventory") || str.includes("stock")).toBe(true)
    expect(str.includes("customer") || str.includes("churn") || str.includes("retention")).toBe(true)
  })
})
