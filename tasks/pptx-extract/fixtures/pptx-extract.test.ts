import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const data = existsSync("slides_data.json") ? JSON.parse(readFileSync("slides_data.json", "utf-8")) : {}

describe("slides_data.json", () => {
  test("exists", () => {
    expect(existsSync("slides_data.json")).toBe(true)
  })
})

describe("slide structure", () => {
  test("slide_count is 4", () => {
    expect(data.slide_count).toBe(4)
  })

  test("title field is Annual Sales Review", () => {
    expect(data.title).toBe("Annual Sales Review")
  })

  test("subtitle field is Fiscal Year 2025", () => {
    expect(data.subtitle).toContain("Fiscal Year 2025")
  })

  test("slides array has 4 entries", () => {
    expect(data.slides).toBeArrayOfSize(4)
  })
})

describe("slide content", () => {
  test("Revenue by Region slide present", () => {
    const slide = data.slides.find((s: any) => s.title?.includes("Revenue"))
    expect(slide).toBeDefined()
  })

  test("Key Metrics slide present", () => {
    const slide = data.slides.find((s: any) => s.title?.includes("Key Metrics"))
    expect(slide).toBeDefined()
  })

  test("Next Steps slide present", () => {
    const slide = data.slides.find((s: any) => s.title?.includes("Next Steps"))
    expect(slide).toBeDefined()
  })
})

describe("financial data", () => {
  test("total_revenue is 9.5", () => {
    expect(Math.abs(data.total_revenue - 9.5)).toBeLessThan(0.1)
  })

  test("regions array has 4 entries", () => {
    expect(data.regions).toBeArrayOfSize(4)
  })

  test("North America revenue is 4.2", () => {
    const na = data.regions.find((r: any) => r.name?.includes("North America"))
    expect(na).toBeDefined()
    expect(Math.abs(na.revenue - 4.2)).toBeLessThan(0.1)
  })

  test("yoy_growth is 23", () => {
    expect(data.yoy_growth).toBe(23)
  })
})

describe("completeness", () => {
  test("all slides have bullets", () => {
    for (const slide of data.slides) {
      expect(slide.bullets).toBeDefined()
      expect(Array.isArray(slide.bullets)).toBe(true)
    }
  })

  test("bullet counts are correct", () => {
    // Slide 1 (title): may have 0-1 bullets
    // Slide 2 (revenue): 4 bullets
    // Slide 3 (metrics): 5 bullets
    // Slide 4 (next steps): 3 bullets
    const revenueSlide = data.slides.find((s: any) => s.title?.includes("Revenue"))
    expect(revenueSlide.bullets.length).toBe(4)
    const metricsSlide = data.slides.find((s: any) => s.title?.includes("Metrics"))
    expect(metricsSlide.bullets.length).toBe(5)
    const nextSlide = data.slides.find((s: any) => s.title?.includes("Next"))
    expect(nextSlide.bullets.length).toBe(3)
  })
})
