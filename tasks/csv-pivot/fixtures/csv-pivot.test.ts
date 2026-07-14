import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("pivot_report.json", () => {
  test("file exists and is valid JSON", () => {
    expect(existsSync("pivot_report.json")).toBe(true)
    const raw = readFileSync("pivot_report.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("total_revenue is 42100", () => {
    const report = JSON.parse(readFileSync("pivot_report.json", "utf-8"))
    expect(report.total_revenue).toBeDefined()
    expect(Math.abs(Number(report.total_revenue) - 42100)).toBeLessThan(1)
  })

  test("top_product is Laptop", () => {
    const report = JSON.parse(readFileSync("pivot_report.json", "utf-8"))
    expect(report.top_product).toBe("Laptop")
  })

  test("top_region is North", () => {
    const report = JSON.parse(readFileSync("pivot_report.json", "utf-8"))
    expect(report.top_region).toBe("North")
  })

  test("monthly_breakdown has 5 months with correct values", () => {
    const report = JSON.parse(readFileSync("pivot_report.json", "utf-8"))
    const mb = report.monthly_breakdown
    expect(mb).toBeDefined()
    expect(Array.isArray(mb)).toBe(true)
    expect(mb.length).toBe(5)

    const expected: Record<string, number> = {
      "2026-01": 8150,
      "2026-02": 10100,
      "2026-03": 7950,
      "2026-04": 8900,
      "2026-05": 7000,
    }
    for (const item of mb) {
      const month = item.month || Object.values(item)[0]
      const rev = item.revenue || Object.values(item)[1]
      if (expected[String(month)] !== undefined) {
        expect(Math.abs(Number(rev) - expected[String(month)])).toBeLessThan(1)
      }
    }
  })

  test("product_summary has 3 products sorted by revenue descending", () => {
    const report = JSON.parse(readFileSync("pivot_report.json", "utf-8"))
    const ps = report.product_summary
    expect(ps).toBeDefined()
    expect(Array.isArray(ps)).toBe(true)
    expect(ps.length).toBe(3)

    // Should be sorted: Laptop (18000), Phone (16000), Tablet (8100)
    const first = ps[0]
    expect(first.product).toBe("Laptop")
    expect(Math.abs(Number(first.total_revenue) - 18000)).toBeLessThan(1)
    expect(first.total_quantity).toBe(15)

    const second = ps[1]
    expect(second.product).toBe("Phone")
    expect(Math.abs(Number(second.total_revenue) - 16000)).toBeLessThan(1)
    expect(second.total_quantity).toBe(20)

    const third = ps[2]
    expect(third.product).toBe("Tablet")
    expect(Math.abs(Number(third.total_revenue) - 8100)).toBeLessThan(1)
    expect(third.total_quantity).toBe(18)
  })
})
