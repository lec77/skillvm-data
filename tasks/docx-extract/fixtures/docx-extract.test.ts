import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const data = existsSync("invoice_data.json") ? JSON.parse(readFileSync("invoice_data.json", "utf-8")) : {}

describe("invoice_data.json", () => {
  test("exists", () => {
    expect(existsSync("invoice_data.json")).toBe(true)
  })
})

describe("header fields", () => {
  test("invoice_number is correct", () => {
    const num = String(data.invoice_number)
    expect(num).toContain("2026-0042")
  })

  test("date field is 2026-02-15", () => {
    expect(data.date).toBe("2026-02-15")
  })

  test("from field is Acme Corp", () => {
    expect(data.from).toBe("Acme Corp")
  })

  test("to field is Widget Industries", () => {
    expect(data.to).toBe("Widget Industries")
  })
})

describe("line items", () => {
  test("has 5 line items", () => {
    expect(data.line_items).toBeArrayOfSize(5)
  })

  test("first item is Web Development", () => {
    const item = data.line_items[0]
    expect(item.item).toBe("Web Development")
    expect(item.quantity).toBe(40)
    expect(item.unit_price).toBe(150)
    expect(item.total).toBe(6000)
  })

  test("last item is DevOps Setup", () => {
    const item = data.line_items[4]
    expect(item.item).toBe("DevOps Setup")
    expect(item.quantity).toBe(8)
    expect(item.total).toBe(1120)
  })

  test("quantities are numbers", () => {
    for (const item of data.line_items) {
      expect(typeof item.quantity).toBe("number")
      expect(typeof item.total).toBe("number")
    }
  })
})

describe("totals", () => {
  test("subtotal is 12170", () => {
    expect(Math.abs(data.subtotal - 12170)).toBeLessThan(1)
  })

  test("tax_rate is 0.08", () => {
    expect(Math.abs(data.tax_rate - 0.08)).toBeLessThan(0.001)
  })

  test("tax_amount is 973.60", () => {
    expect(Math.abs(data.tax_amount - 973.60)).toBeLessThan(1)
  })

  test("total_due is 13143.60", () => {
    expect(Math.abs(data.total_due - 13143.60)).toBeLessThan(1)
  })
})

describe("payment", () => {
  test("payment_terms is Net 30", () => {
    expect(data.payment_terms).toContain("Net 30")
  })

  test("due_date is 2026-03-17", () => {
    expect(data.due_date).toBe("2026-03-17")
  })
})
