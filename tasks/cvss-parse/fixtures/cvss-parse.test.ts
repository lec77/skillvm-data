import { expect, test, describe } from "bun:test"
import { readFileSync } from "fs"

const data = JSON.parse(readFileSync("vulnerability_report.json", "utf-8"))

describe("output file exists and valid JSON", () => {
  test("output file exists and parses as valid JSON", () => {
    expect(data).toBeDefined()
    expect(typeof data).toBe("object")
  })

  test("has required top-level keys", () => {
    expect(data).toHaveProperty("vulnerabilities")
    expect(data).toHaveProperty("summary")
    expect(data).toHaveProperty("packages")
  })
})

describe("vuln count", () => {
  test("has exactly 12 vulnerabilities", () => {
    expect(Array.isArray(data.vulnerabilities)).toBe(true)
    expect(data.vulnerabilities.length).toBe(12)
  })

  test("each vulnerability has required fields", () => {
    for (const v of data.vulnerabilities) {
      expect(v).toHaveProperty("cve_id")
      expect(v).toHaveProperty("package")
      expect(v).toHaveProperty("version")
      expect(v).toHaveProperty("score")
      expect(v).toHaveProperty("severity")
      expect(v).toHaveProperty("source")
    }
  })
})

describe("severity counts", () => {
  test("critical count is 2", () => {
    const criticals = data.vulnerabilities.filter((v: any) => v.severity === "Critical")
    expect(criticals.length).toBe(2)
    expect(data.summary.critical).toBe(2)
  })

  test("high count is 4", () => {
    const highs = data.vulnerabilities.filter((v: any) => v.severity === "High")
    expect(highs.length).toBe(4)
    expect(data.summary.high).toBe(4)
  })

  test("medium count is 5", () => {
    const mediums = data.vulnerabilities.filter(
      (v: any) => v.severity === "Medium"
    )
    expect(mediums.length).toBe(5)
    expect(data.summary.medium).toBe(5)
  })

  test("low count is 1", () => {
    const lows = data.vulnerabilities.filter((v: any) => v.severity === "Low")
    expect(lows.length).toBe(1)
    expect(data.summary.low).toBe(1)
  })

  test("summary total is 12", () => {
    expect(data.summary.total).toBe(12)
  })
})

describe("source priority", () => {
  function findVuln(cveId: string) {
    return data.vulnerabilities.find((v: any) => v.cve_id === cveId)
  }

  test("CVE-2024-0001 uses NVD V3 score 9.8 (NVD preferred over GHSA)", () => {
    const vuln = findVuln("CVE-2024-0001")
    expect(vuln).toBeDefined()
    expect(Math.abs(vuln.score - 9.8)).toBeLessThan(0.01)
    expect(vuln.source).toBe("nvd")
    expect(vuln.severity).toBe("Critical")
  })

  test("CVE-2024-0002 uses GHSA V3 score 7.5 (only GHSA available)", () => {
    const vuln = findVuln("CVE-2024-0002")
    expect(vuln).toBeDefined()
    expect(Math.abs(vuln.score - 7.5)).toBeLessThan(0.01)
    expect(vuln.source).toBe("ghsa")
    expect(vuln.severity).toBe("High")
  })

  test("CVE-2024-0003 uses NVD V3 score 5.3 (NVD preferred over RedHat)", () => {
    const vuln = findVuln("CVE-2024-0003")
    expect(vuln).toBeDefined()
    expect(Math.abs(vuln.score - 5.3)).toBeLessThan(0.01)
    expect(vuln.source).toBe("nvd")
    expect(vuln.severity).toBe("Medium")
  })

  test("CVE-2024-0005 uses RedHat V3 score 3.7 (only RedHat available)", () => {
    const vuln = findVuln("CVE-2024-0005")
    expect(vuln).toBeDefined()
    expect(Math.abs(vuln.score - 3.7)).toBeLessThan(0.01)
    expect(vuln.source).toBe("redhat")
    expect(vuln.severity).toBe("Low")
  })

  test("CVE-2024-0006 uses NVD V3 score 6.5 (NVD preferred over GHSA)", () => {
    const vuln = findVuln("CVE-2024-0006")
    expect(vuln).toBeDefined()
    expect(Math.abs(vuln.score - 6.5)).toBeLessThan(0.01)
    expect(vuln.source).toBe("nvd")
    expect(vuln.severity).toBe("Medium")
  })

  test("CVE-2024-0010 uses NVD V3 score 7.2 (NVD preferred over GHSA and RedHat)", () => {
    const vuln = findVuln("CVE-2024-0010")
    expect(vuln).toBeDefined()
    expect(Math.abs(vuln.score - 7.2)).toBeLessThan(0.01)
    expect(vuln.source).toBe("nvd")
    expect(vuln.severity).toBe("High")
  })
})

describe("V2 fallback", () => {
  test("CVE-2024-0007 uses NVD V2 score 5.0 when no V3 exists", () => {
    const vuln = data.vulnerabilities.find((v: any) => v.cve_id === "CVE-2024-0007")
    expect(vuln).toBeDefined()
    expect(Math.abs(vuln.score - 5.0)).toBeLessThan(0.01)
    expect(vuln.source).toBe("nvd")
    expect(vuln.severity).toBe("Medium")
  })
})

describe("packages array", () => {
  test("3 packages are present", () => {
    expect(Array.isArray(data.packages)).toBe(true)
    expect(data.packages.length).toBe(3)
  })

  test("package entries have required fields", () => {
    for (const pkg of data.packages) {
      expect(pkg).toHaveProperty("name")
      expect(pkg).toHaveProperty("vuln_count")
      expect(pkg).toHaveProperty("max_severity")
    }
  })

  test("lodash has 4 vulnerabilities and max_severity Critical", () => {
    const lodash = data.packages.find((p: any) => p.name === "lodash")
    expect(lodash).toBeDefined()
    expect(lodash.vuln_count).toBe(4)
    expect(lodash.max_severity).toBe("Critical")
  })

  test("express has 4 vulnerabilities and max_severity Critical", () => {
    const express = data.packages.find((p: any) => p.name === "express")
    expect(express).toBeDefined()
    expect(express.vuln_count).toBe(4)
    expect(express.max_severity).toBe("Critical")
  })

  test("minimist has 4 vulnerabilities and max_severity High", () => {
    const minimist = data.packages.find((p: any) => p.name === "minimist")
    expect(minimist).toBeDefined()
    expect(minimist.vuln_count).toBe(4)
    expect(minimist.max_severity).toBe("High")
  })
})
