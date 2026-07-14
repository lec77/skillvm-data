import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("regression_results.json file exists", () => {
  test("file exists and is valid JSON", () => {
    expect(existsSync("regression_results.json")).toBe(true)
    const raw = readFileSync("regression_results.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })
})

describe("r.squared", () => {
  test("model.r_squared exists", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    expect(results.model).toBeDefined()
    expect(results.model.r_squared).toBeDefined()
  })

  test("R-squared is greater than 0.8", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    const r2 = Number(results.model.r_squared)
    expect(r2).toBeGreaterThan(0.8)
  })

  test("adj_r_squared is greater than 0.8", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    const adjR2 = Number(results.model.adj_r_squared)
    expect(adjR2).toBeGreaterThan(0.8)
  })
})

describe("sqft coefficient", () => {
  test("coefficients array exists", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    expect(results.coefficients).toBeDefined()
    expect(Array.isArray(results.coefficients)).toBe(true)
    expect(results.coefficients.length).toBeGreaterThanOrEqual(3)
  })

  test("sqft coefficient is positive (greater than 50)", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    const sqftCoef = results.coefficients.find(
      (c: any) => String(c.variable).toLowerCase().includes("sqft")
    )
    expect(sqftCoef).toBeDefined()
    const coef = Number(sqftCoef.coefficient)
    expect(coef).toBeGreaterThan(50)
  })

  test("sqft coefficient is significant (p_value < 0.05)", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    const sqftCoef = results.coefficients.find(
      (c: any) => String(c.variable).toLowerCase().includes("sqft")
    )
    expect(sqftCoef).toBeDefined()
    const p = Number(sqftCoef.p_value)
    expect(p).toBeLessThan(0.05)
  })
})

describe("age coefficient", () => {
  test("age coefficient is negative", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    const ageCoef = results.coefficients.find(
      (c: any) => String(c.variable).toLowerCase().includes("age")
    )
    expect(ageCoef).toBeDefined()
    const coef = Number(ageCoef.coefficient)
    expect(coef).toBeLessThan(0)
  })

  test("age coefficient is significant (p_value < 0.05)", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    const ageCoef = results.coefficients.find(
      (c: any) => String(c.variable).toLowerCase().includes("age")
    )
    expect(ageCoef).toBeDefined()
    const p = Number(ageCoef.p_value)
    expect(p).toBeLessThan(0.05)
  })
})

describe("vif", () => {
  test("vif array exists", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    expect(results.vif).toBeDefined()
    expect(Array.isArray(results.vif)).toBe(true)
  })

  test("vif has entries for all 3 predictors", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    expect(results.vif.length).toBeGreaterThanOrEqual(3)
  })

  test("each vif entry has variable and vif_value fields", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    for (const entry of results.vif) {
      expect(entry.variable).toBeDefined()
      expect(entry.vif_value).toBeDefined()
      expect(Number(entry.vif_value)).toBeGreaterThan(0)
    }
  })
})

describe("prediction", () => {
  test("prediction field exists", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    expect(results.prediction).toBeDefined()
  })

  test("predicted_price for sqft=2000, bedrooms=3, age=20 is in range 200000-350000", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    // Accept numeric value directly or nested under predicted_price key
    let price: number
    if (typeof results.prediction === "number") {
      price = results.prediction
    } else {
      price = Number(
        results.prediction.predicted_price ??
          results.prediction.price ??
          Object.values(results.prediction)[0]
      )
    }
    expect(price).toBeGreaterThan(200000)
    expect(price).toBeLessThan(350000)
  })
})

describe("model significant", () => {
  test("f_statistic exists and is greater than 1", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    expect(results.model.f_statistic).toBeDefined()
    const f = Number(results.model.f_statistic)
    expect(f).toBeGreaterThan(1)
  })

  test("f_p_value is less than 0.05 (model is significant)", () => {
    const results = JSON.parse(readFileSync("regression_results.json", "utf-8"))
    expect(results.model.f_p_value).toBeDefined()
    const p = Number(results.model.f_p_value)
    expect(p).toBeLessThan(0.05)
  })
})
