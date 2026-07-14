import { expect, test, describe } from "bun:test"
import { readFileSync } from "fs"

const data = JSON.parse(readFileSync("extracted.json", "utf-8"))

describe("extracted.json structure", () => {
  test("is an array", () => {
    expect(Array.isArray(data)).toBe(true)
  })

  test("has correct number of entries", () => {
    expect(data.length).toBe(20)
  })

  test("each entry has required fields", () => {
    for (const entry of data) {
      expect(entry).toHaveProperty("timestamp")
      expect(entry).toHaveProperty("level")
      expect(entry).toHaveProperty("ip")
      expect(entry).toHaveProperty("method")
      expect(entry).toHaveProperty("path")
      expect(entry).toHaveProperty("status")
      expect(entry).toHaveProperty("duration_ms")
    }
  })

  test("status is a number", () => {
    for (const entry of data) {
      expect(typeof entry.status).toBe("number")
    }
  })

  test("duration_ms is a number", () => {
    for (const entry of data) {
      expect(typeof entry.duration_ms).toBe("number")
    }
  })
})

describe("extracted data correctness", () => {
  test("correct unique IPs", () => {
    const ips = new Set(data.map((e: any) => e.ip))
    expect(ips.size).toBe(4)
    expect(ips.has("192.168.1.100")).toBe(true)
    expect(ips.has("10.0.0.55")).toBe(true)
    expect(ips.has("172.16.0.1")).toBe(true)
    expect(ips.has("203.0.113.42")).toBe(true)
  })

  test("correct count of ERROR entries", () => {
    const errors = data.filter((e: any) => e.level === "ERROR")
    expect(errors.length).toBe(7)
  })

  test("correct count of INFO entries", () => {
    const infos = data.filter((e: any) => e.level === "INFO")
    expect(infos.length).toBe(9)
  })

  test("correct count of WARN entries", () => {
    const warns = data.filter((e: any) => e.level === "WARN")
    expect(warns.length).toBe(4)
  })

  test("missing level entry is absent", () => {
    const debugs = data.filter((e: any) => e.level === "DEBUG")
    expect(debugs.length).toBe(0)
  })
})

describe("message field handling", () => {
  test("ERROR entries have message field", () => {
    const errors = data.filter((e: any) => e.level === "ERROR")
    for (const entry of errors) {
      expect(entry).toHaveProperty("message")
      expect(typeof entry.message).toBe("string")
      expect(entry.message.length).toBeGreaterThan(0)
    }
  })

  test("non-ERROR entries do not have message field", () => {
    const nonErrors = data.filter((e: any) => e.level !== "ERROR")
    for (const entry of nonErrors) {
      expect(entry.message).toBeUndefined()
    }
  })
})

describe("exact entry parsing", () => {
  test("first entry is parsed correctly", () => {
    const first = data[0]
    expect(first.timestamp).toBe("2026-01-15 08:23:41")
    expect(first.level).toBe("INFO")
    expect(first.ip).toBe("192.168.1.100")
    expect(first.method).toBe("GET")
    expect(first.path).toBe("/api/users")
    expect(first.status).toBe(200)
    expect(first.duration_ms).toBe(45)
  })

  test("entry with error message is parsed correctly", () => {
    const second = data[1]
    expect(second.timestamp).toBe("2026-01-15 08:23:42")
    expect(second.level).toBe("ERROR")
    expect(second.ip).toBe("10.0.0.55")
    expect(second.method).toBe("POST")
    expect(second.path).toBe("/api/login")
    expect(second.status).toBe(401)
    expect(second.duration_ms).toBe(12)
    expect(second.message).toBe("Invalid credentials")
  })

  test("all HTTP methods are present", () => {
    const methods = new Set(data.map((e: any) => e.method))
    expect(methods.has("GET")).toBe(true)
    expect(methods.has("POST")).toBe(true)
    expect(methods.has("PUT")).toBe(true)
    expect(methods.has("DELETE")).toBe(true)
  })

  test("all expected status codes are present", () => {
    const statuses = new Set(data.map((e: any) => e.status))
    expect(statuses.has(200)).toBe(true)
    expect(statuses.has(201)).toBe(true)
    expect(statuses.has(204)).toBe(true)
    expect(statuses.has(304)).toBe(true)
    expect(statuses.has(401)).toBe(true)
    expect(statuses.has(403)).toBe(true)
    expect(statuses.has(500)).toBe(true)
  })
})

describe("edge case parsing", () => {
  test("path with query string strips query params", () => {
    // Line 16: GET /api/search?q=hello+world&page=2
    const entry = data[15]
    expect(entry.path).toBe("/api/search")
    expect(entry.method).toBe("GET")
    expect(entry.status).toBe(200)
    expect(entry.duration_ms).toBe(88)
  })

  test("error message with escaped quotes is parsed", () => {
    // Line 17: "Connection to \"db-primary\" failed"
    const entry = data[16]
    expect(entry.level).toBe("ERROR")
    expect(entry.status).toBe(500)
    expect(entry.duration_ms).toBe(5023)
    expect(entry.message).toContain("db-primary")
    expect(entry.message).toContain("failed")
  })

  test("second path with query string strips query params", () => {
    // Line 18: GET /api/config?env=prod&debug=true&v=3
    const entry = data[17]
    expect(entry.path).toBe("/api/config")
    expect(entry.level).toBe("WARN")
    expect(entry.status).toBe(304)
  })

  test("error message with special characters is parsed", () => {
    // Line 20: "SSL cert expired: CN=*.example.com, serial=0x1A2B"
    const entry = data[19]
    expect(entry.level).toBe("ERROR")
    expect(entry.ip).toBe("192.168.1.100")
    expect(entry.status).toBe(500)
    expect(entry.duration_ms).toBe(3501)
    expect(entry.message).toContain("SSL cert expired")
    expect(entry.message).toContain("*.example.com")
  })

  test("high duration values are parsed correctly", () => {
    // Lines with 1503ms, 2010ms, 5023ms, 3501ms
    const highDuration = data.filter((e: any) => e.duration_ms > 1000)
    expect(highDuration.length).toBe(4)
  })
})
