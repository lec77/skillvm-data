import { expect, test, describe } from "bun:test"
import { Database } from "bun:sqlite"
import { existsSync, readFileSync } from "fs"

describe("SQLite database", () => {
  test("shop.db exists", () => {
    expect(existsSync("shop.db")).toBe(true)
  })

  test("orders table has correct columns", () => {
    const db = new Database("shop.db", { readonly: true })
    const columns = db.prepare("PRAGMA table_info(orders)").all() as any[]
    const colNames = columns.map((c: any) => c.name)
    expect(colNames).toContain("order_id")
    expect(colNames).toContain("customer_name")
    expect(colNames).toContain("product")
    expect(colNames).toContain("quantity")
    expect(colNames).toContain("unit_price")
    expect(colNames).toContain("discount")
    expect(colNames).toContain("order_date")
    db.close()
  })

  test("orders table has 20 rows", () => {
    const db = new Database("shop.db", { readonly: true })
    const result = db.prepare("SELECT COUNT(*) as cnt FROM orders").get() as any
    expect(result.cnt).toBe(20)
    db.close()
  })

  test("numeric columns use proper types", () => {
    const db = new Database("shop.db", { readonly: true })
    const row = db.prepare("SELECT typeof(quantity) as qty_t, typeof(unit_price) as price_t FROM orders LIMIT 1").get() as any
    // quantity should be integer, not text
    expect(row.qty_t).toBe("integer")
    // unit_price should be real, not text
    expect(row.price_t).toBe("real")
    db.close()
  })

  test("at least one index exists", () => {
    const db = new Database("shop.db", { readonly: true })
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all() as any[]
    expect(indexes.length).toBeGreaterThanOrEqual(1)
    db.close()
  })
})

describe("query_results.json", () => {
  test("file exists", () => {
    expect(existsSync("query_results.json")).toBe(true)
  })

  test("total_revenue is correct", () => {
    const results = JSON.parse(readFileSync("query_results.json", "utf-8"))
    // SUM(quantity * unit_price * (1 - discount)) across all 20 orders = 2406.81
    expect(results.total_revenue).toBeCloseTo(2406.81, 0)
  })

  test("top_customer is Diana", () => {
    const results = JSON.parse(readFileSync("query_results.json", "utf-8"))
    // Diana: (8*12.50) + (1*49.95) + (4*99.99) + (2*24.99*0.90) = 594.89
    expect(results.top_customer).toBe("Diana")
  })

  test("product_ranking order is correct", () => {
    const results = JSON.parse(readFileSync("query_results.json", "utf-8"))
    // Widget=39, Gadget=14, Doohickey=12, Gizmo=9
    const ranking = results.product_ranking
    expect(ranking).toBeArrayOfSize(4)
    expect(ranking[0]).toBe("Widget")
    expect(ranking[1]).toBe("Gadget")
    expect(ranking[2]).toBe("Doohickey")
    expect(ranking[3]).toBe("Gizmo")
  })

  test("monthly_revenue has 4 months", () => {
    const results = JSON.parse(readFileSync("query_results.json", "utf-8"))
    const mr = results.monthly_revenue
    expect(mr).toBeDefined()
    expect(Array.isArray(mr) ? mr.length : Object.keys(mr).length).toBe(4)
  })

  test("monthly_revenue values are correct", () => {
    const results = JSON.parse(readFileSync("query_results.json", "utf-8"))
    const mr = results.monthly_revenue
    // Expected: 2026-01: 424.86, 2026-02: 604.88, 2026-03: 964.65, 2026-04: 412.41
    const expected: Record<string, number> = {
      "2026-01": 424.86, "2026-02": 604.88, "2026-03": 964.65, "2026-04": 412.41,
    }
    // Handle both array-of-objects and dict formats
    let actual: Record<string, number> = {}
    if (Array.isArray(mr)) {
      for (const item of mr) {
        const month = item.month || item.order_month || Object.values(item)[0]
        const rev = item.revenue || item.monthly_revenue || item.total_revenue || Object.values(item)[1]
        actual[String(month)] = Number(rev)
      }
    } else {
      actual = mr
    }
    for (const [month, expVal] of Object.entries(expected)) {
      expect(Math.abs(Number(actual[month]) - expVal)).toBeLessThan(1)
    }
  })

  test("customer_rank has 5 customers with rank numbers", () => {
    const results = JSON.parse(readFileSync("query_results.json", "utf-8"))
    const cr = results.customer_rank
    expect(cr).toBeDefined()
    const items = Array.isArray(cr) ? cr : Object.entries(cr).map(([k, v]: [string, any]) => ({ name: k, ...v }))
    expect(items.length).toBe(5)
    // First ranked should be Diana (highest spender)
    const first = items[0]
    const name = first.customer_name || first.name || first.customer
    expect(name).toBe("Diana")
    // Check rank field exists
    const rank = first.rank || first.customer_rank || first.ranking
    expect(rank).toBe(1)
  })
})
