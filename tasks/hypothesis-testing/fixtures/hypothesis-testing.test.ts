import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

describe("stats_results.json file exists", () => {
  test("file exists and is valid JSON", () => {
    expect(existsSync("stats_results.json")).toBe(true)
    const raw = readFileSync("stats_results.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })
})

describe("descriptives", () => {
  test("descriptives has 3 groups", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    expect(results.descriptives).toBeDefined()
    expect(Array.isArray(results.descriptives)).toBe(true)
    expect(results.descriptives.length).toBe(3)
  })

  test("group A mean is approximately 50 (48-52)", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    const groupA = results.descriptives.find(
      (d: any) => String(d.group).toUpperCase() === "A"
    )
    expect(groupA).toBeDefined()
    const mean = Number(groupA.mean)
    expect(mean).toBeGreaterThan(48)
    expect(mean).toBeLessThan(52)
    expect(Number(groupA.n)).toBe(30)
  })

  test("group B mean is approximately 55 (53-57)", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    const groupB = results.descriptives.find(
      (d: any) => String(d.group).toUpperCase() === "B"
    )
    expect(groupB).toBeDefined()
    const mean = Number(groupB.mean)
    expect(mean).toBeGreaterThan(53)
    expect(mean).toBeLessThan(57)
  })

  test("group C mean is approximately 50 (48-52)", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    const groupC = results.descriptives.find(
      (d: any) => String(d.group).toUpperCase() === "C"
    )
    expect(groupC).toBeDefined()
    const mean = Number(groupC.mean)
    expect(mean).toBeGreaterThan(48)
    expect(mean).toBeLessThan(52)
  })
})

describe("anova", () => {
  test("ANOVA result exists with f_statistic and p_value", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    expect(results.anova).toBeDefined()
    expect(results.anova.f_statistic).toBeDefined()
    expect(results.anova.p_value).toBeDefined()
  })

  test("ANOVA p_value is less than 0.05 (significant)", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    const p = Number(results.anova.p_value)
    expect(p).toBeLessThan(0.05)
  })

  test("ANOVA significant field is true", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    // Accept boolean true or string "true" or truthy value
    const sig = results.anova.significant
    expect(sig === true || sig === "true" || sig === 1).toBe(true)
  })
})

describe("pairwise A-B", () => {
  test("pairwise array exists", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    expect(results.pairwise).toBeDefined()
    expect(Array.isArray(results.pairwise)).toBe(true)
    expect(results.pairwise.length).toBeGreaterThanOrEqual(3)
  })

  test("A-B comparison is significant (p_adjusted < 0.05)", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    const ab = results.pairwise.find((pw: any) => {
      const g1 = String(pw.group1).toUpperCase()
      const g2 = String(pw.group2).toUpperCase()
      return (g1 === "A" && g2 === "B") || (g1 === "B" && g2 === "A")
    })
    expect(ab).toBeDefined()
    const pAdj = Number(ab.p_adjusted)
    expect(pAdj).toBeLessThan(0.05)
  })

  test("A-B significant field is true", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    const ab = results.pairwise.find((pw: any) => {
      const g1 = String(pw.group1).toUpperCase()
      const g2 = String(pw.group2).toUpperCase()
      return (g1 === "A" && g2 === "B") || (g1 === "B" && g2 === "A")
    })
    expect(ab).toBeDefined()
    const sig = ab.significant
    expect(sig === true || sig === "true" || sig === 1).toBe(true)
  })
})

describe("pairwise A-C", () => {
  test("A-C comparison is NOT significant (p_adjusted >= 0.05)", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    const ac = results.pairwise.find((pw: any) => {
      const g1 = String(pw.group1).toUpperCase()
      const g2 = String(pw.group2).toUpperCase()
      return (g1 === "A" && g2 === "C") || (g1 === "C" && g2 === "A")
    })
    expect(ac).toBeDefined()
    const pAdj = Number(ac.p_adjusted)
    expect(pAdj).toBeGreaterThanOrEqual(0.05)
  })

  test("A-C significant field is false", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    const ac = results.pairwise.find((pw: any) => {
      const g1 = String(pw.group1).toUpperCase()
      const g2 = String(pw.group2).toUpperCase()
      return (g1 === "A" && g2 === "C") || (g1 === "C" && g2 === "A")
    })
    expect(ac).toBeDefined()
    const sig = ac.significant
    expect(sig === false || sig === "false" || sig === 0).toBe(true)
  })
})

describe("effect size", () => {
  test("Cohen's d for A-B is between 0.3 and 1.5 (medium-to-large)", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    const ab = results.pairwise.find((pw: any) => {
      const g1 = String(pw.group1).toUpperCase()
      const g2 = String(pw.group2).toUpperCase()
      return (g1 === "A" && g2 === "B") || (g1 === "B" && g2 === "A")
    })
    expect(ab).toBeDefined()
    const d = Math.abs(Number(ab.cohens_d))
    expect(d).toBeGreaterThan(0.3)
    expect(d).toBeLessThan(1.5)
  })
})

describe("power analysis", () => {
  test("power_analysis exists with required_n_per_group > 0", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    expect(results.power_analysis).toBeDefined()
    const n = Number(results.power_analysis.required_n_per_group)
    expect(n).toBeGreaterThan(0)
  })

  test("power_analysis includes effect_size field", () => {
    const results = JSON.parse(readFileSync("stats_results.json", "utf-8"))
    expect(results.power_analysis.effect_size).toBeDefined()
    const es = Number(results.power_analysis.effect_size)
    expect(es).toBeGreaterThan(0)
  })
})
