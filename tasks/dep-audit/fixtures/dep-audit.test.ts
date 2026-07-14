import { expect, test, describe } from "bun:test"
import { readFileSync } from "fs"

const data = JSON.parse(readFileSync("audit_report.json", "utf-8"))

describe("output file exists and valid JSON", () => {
  test("output file exists and parses as valid JSON", () => {
    expect(data).toBeDefined()
    expect(typeof data).toBe("object")
  })

  test("has required top-level keys", () => {
    expect(data).toHaveProperty("vulnerable")
    expect(data).toHaveProperty("safe")
    expect(data).toHaveProperty("risk_summary")
  })
})

describe("vulnerable count", () => {
  test("4 vulnerable packages identified", () => {
    expect(Array.isArray(data.vulnerable)).toBe(true)
    expect(data.vulnerable.length).toBe(4)
  })

  test("each vulnerable entry has required fields", () => {
    for (const v of data.vulnerable) {
      expect(v).toHaveProperty("package")
      expect(v).toHaveProperty("installed_version")
      expect(v).toHaveProperty("severity")
      expect(v).toHaveProperty("advisory_id")
    }
  })
})

describe("safe count and safe list", () => {
  test("4 safe packages identified", () => {
    expect(Array.isArray(data.safe)).toBe(true)
    expect(data.safe.length).toBe(4)
  })

  test("safe list contains expected packages", () => {
    const safeSet = new Set(data.safe)
    expect(safeSet.has("chalk")).toBe(true)
    expect(safeSet.has("dotenv")).toBe(true)
    expect(safeSet.has("uuid")).toBe(true)
    expect(safeSet.has("semver")).toBe(true)
  })

  test("vulnerable packages are not in the safe list", () => {
    const safeSet = new Set(data.safe)
    expect(safeSet.has("lodash")).toBe(false)
    expect(safeSet.has("express")).toBe(false)
    expect(safeSet.has("axios")).toBe(false)
    expect(safeSet.has("minimist")).toBe(false)
  })
})

describe("severity correct", () => {
  function findVuln(pkg: string) {
    return data.vulnerable.find((v: any) => v.package === pkg)
  }

  test("critical lodash — severity is Critical", () => {
    const v = findVuln("lodash")
    expect(v).toBeDefined()
    expect(v.severity.toLowerCase()).toBe("critical")
  })

  test("high express — severity is High", () => {
    const v = findVuln("express")
    expect(v).toBeDefined()
    expect(v.severity.toLowerCase()).toBe("high")
  })

  test("medium axios — severity is Medium or Moderate", () => {
    const v = findVuln("axios")
    expect(v).toBeDefined()
    const normalized = v.severity.toLowerCase()
    expect(normalized === "medium" || normalized === "moderate").toBe(true)
  })

  test("low minimist — severity is Low", () => {
    const v = findVuln("minimist")
    expect(v).toBeDefined()
    expect(v.severity.toLowerCase()).toBe("low")
  })

  test("each vulnerable entry has an advisory_id", () => {
    for (const v of data.vulnerable) {
      expect(typeof v.advisory_id).toBe("string")
      expect(v.advisory_id.length).toBeGreaterThan(0)
    }
  })
})

describe("patched versions", () => {
  function findVuln(pkg: string) {
    return data.vulnerable.find((v: any) => v.package === pkg)
  }

  test("lodash has a patched_version recorded", () => {
    const v = findVuln("lodash")
    expect(v).toBeDefined()
    expect(v.patched_version).toBeDefined()
    expect(v.patched_version).not.toBeNull()
  })

  test("express has a patched_version recorded", () => {
    const v = findVuln("express")
    expect(v).toBeDefined()
    expect(v.patched_version).toBeDefined()
    expect(v.patched_version).not.toBeNull()
  })

  test("axios has a patched_version recorded", () => {
    const v = findVuln("axios")
    expect(v).toBeDefined()
    expect(v.patched_version).toBeDefined()
    expect(v.patched_version).not.toBeNull()
  })

  test("minimist has a patched_version recorded", () => {
    const v = findVuln("minimist")
    expect(v).toBeDefined()
    expect(v.patched_version).toBeDefined()
    expect(v.patched_version).not.toBeNull()
  })
})

describe("risk summary", () => {
  test("total_vulnerable is 4", () => {
    expect(data.risk_summary.total_vulnerable).toBe(4)
  })

  test("total_safe is 4", () => {
    expect(data.risk_summary.total_safe).toBe(4)
  })

  test("critical count is 1", () => {
    expect(data.risk_summary.critical).toBe(1)
  })

  test("high count is 1", () => {
    expect(data.risk_summary.high).toBe(1)
  })

  test("medium count is 1 (moderate normalizes to medium)", () => {
    expect(data.risk_summary.medium).toBe(1)
  })

  test("low count is 1", () => {
    expect(data.risk_summary.low).toBe(1)
  })
})
