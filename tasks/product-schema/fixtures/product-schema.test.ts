import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const raw = existsSync("schema.json") ? readFileSync("schema.json", "utf-8") : "{}"
const data = JSON.parse(raw)

describe("schema.json", () => {
  test("exists", () => {
    expect(existsSync("schema.json")).toBe(true)
  })

  test("is valid JSON", () => {
    expect(() => JSON.parse(raw)).not.toThrow()
  })
})

describe("JSON-LD structure", () => {
  test("has @context schema.org", () => {
    expect(data["@context"]).toMatch(/schema\.org/)
  })

  test("has @type Product", () => {
    expect(data["@type"]).toBe("Product")
  })
})

describe("product fields", () => {
  test("name is ProTech Laptop X1 Carbon", () => {
    expect(data.name).toBe("ProTech Laptop X1 Carbon")
  })

  test("description contains lightweight or ultrabook", () => {
    expect(data.description).toMatch(/lightweight|ultrabook|carbon fiber/i)
  })

  test("brand contains ProTech", () => {
    const brand = typeof data.brand === "object" ? data.brand.name : data.brand
    expect(brand).toBe("ProTech")
  })

  test("sku is PT-X1C-2025", () => {
    expect(data.sku).toBe("PT-X1C-2025")
  })
})

describe("offers", () => {
  const offers = data.offers || {}

  test("offers has @type Offer", () => {
    expect(offers["@type"]).toBe("Offer")
  })

  test("price is 1299.99", () => {
    const price = parseFloat(offers.price)
    expect(Math.abs(price - 1299.99)).toBeLessThan(0.01)
  })

  test("priceCurrency is USD", () => {
    expect(offers.priceCurrency).toBe("USD")
  })

  test("availability indicates InStock", () => {
    expect(offers.availability).toMatch(/InStock/i)
  })
})

describe("aggregateRating", () => {
  const rating = data.aggregateRating || {}

  test("has @type AggregateRating", () => {
    expect(rating["@type"]).toBe("AggregateRating")
  })

  test("ratingValue is 4.6", () => {
    const val = parseFloat(rating.ratingValue)
    expect(Math.abs(val - 4.6)).toBeLessThan(0.01)
  })

  test("reviewCount is 238", () => {
    const count = parseInt(rating.reviewCount, 10)
    expect(count).toBe(238)
  })
})
