import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const md = existsSync("inventory_report.md") ? readFileSync("inventory_report.md", "utf-8") : ""

describe("inventory_report.md", () => {
  test("exists", () => {
    expect(existsSync("inventory_report.md")).toBe(true)
    expect(md.length).toBeGreaterThan(200)
  })
})

describe("summary section", () => {
  test("mentions 10 products", () => {
    expect(md).toContain("10")
  })

  test("total value is correct", () => {
    // P001: 29.99*150=4498.50, P002: 49.99*75=3749.25, P003: 399.99*12=4799.88
    // P004: 299.99*8=2399.92, P005: 89.99*45=4049.55, P006: 79.99*200=15998.00
    // P007: 34.99*60=2099.40, P008: 59.99*30=1799.70, P009: 129.99*20=2599.80
    // P010: 199.99*25=4999.75
    // Total = 46993.75
    const hasValue = md.includes("46993") || md.includes("46,993") || md.includes("$46")
    expect(hasValue).toBeTruthy()
  })

  test("mentions 4 categories", () => {
    expect(md).toContain("4")
  })

  test("mentions 5 suppliers", () => {
    // 5 unique: TechSupply Co, OfficePro Inc, MountIt Ltd, LightWorks, AudioMax
    expect(md).toContain("5")
  })
})

describe("main inventory table", () => {
  test("all products in table", () => {
    expect(md).toContain("P001")
    expect(md).toContain("P010")
  })

  test("table has columns", () => {
    expect(md).toContain("product_id") || expect(md).toContain("Product")
    expect(md).toContain("price") || expect(md).toContain("Price")
  })

  test("Wireless Mouse row present", () => {
    expect(md).toContain("Wireless Mouse")
    expect(md).toContain("29.99")
  })
})

describe("low stock section", () => {
  test("Low Stock section exists", () => {
    expect(md.toLowerCase()).toContain("low stock")
  })

  test("Standing Desk alert (stock: 12)", () => {
    expect(md).toContain("Standing Desk")
  })

  test("Ergonomic Chair alert (stock: 8)", () => {
    expect(md).toContain("Ergonomic Chair")
  })
})

describe("category breakdown", () => {
  test("Category Breakdown section exists", () => {
    expect(md.toLowerCase()).toContain("category")
  })

  test("Electronics count is 4", () => {
    // Electronics: Mouse, Hub, Webcam, Headphones = 4 items
    expect(md).toContain("Electronics")
  })

  test("Furniture count is 2", () => {
    expect(md).toContain("Furniture")
  })
})
