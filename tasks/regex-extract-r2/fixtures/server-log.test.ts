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
    expect(ips.has("203.0.113.9")).toBe(true)
    expect(ips.has("10.20.30.40")).toBe(true)
    expect(ips.has("192.168.44.5")).toBe(true)
    expect(ips.has("172.16.99.201")).toBe(true)
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
    expect(first.timestamp).toBe("2026-05-18 09:41:02")
    expect(first.level).toBe("INFO")
    expect(first.ip).toBe("203.0.113.9")
    expect(first.method).toBe("GET")
    expect(first.path).toBe("/edge/zones")
    expect(first.status).toBe(200)
    expect(first.duration_ms).toBe(58)
  })

  test("entry with error message is parsed correctly", () => {
    const second = data[1]
    expect(second.timestamp).toBe("2026-05-18 09:41:03")
    expect(second.level).toBe("ERROR")
    expect(second.ip).toBe("10.20.30.40")
    expect(second.method).toBe("POST")
    expect(second.path).toBe("/edge/session")
    expect(second.status).toBe(401)
    expect(second.duration_ms).toBe(22)
    expect(second.message).toBe("Signing key rotated")
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
    // Line 13: GET /edge/search?tag=video&region=apac
    const entry = data[12]
    expect(entry.path).toBe("/edge/search")
    expect(entry.method).toBe("GET")
    expect(entry.status).toBe(200)
    expect(entry.duration_ms).toBe(102)
  })

  test("error message with escaped quotes is parsed", () => {
    // Line 8: "Origin \"eu-west-cache\" returned malformed body"
    const entry = data[7]
    expect(entry.level).toBe("ERROR")
    expect(entry.status).toBe(500)
    expect(entry.duration_ms).toBe(3644)
    expect(entry.message).toContain("eu-west-cache")
    expect(entry.message).toContain("malformed body")
  })

  test("second path with query string strips query params", () => {
    // Line 3: GET /edge/purge?scope=all&async=true
    const entry = data[2]
    expect(entry.path).toBe("/edge/purge")
    expect(entry.level).toBe("WARN")
    expect(entry.status).toBe(304)
  })

  test("error message with special characters is parsed", () => {
    // Line 20: "Certificate chain invalid: CN=*.cdn.example.net, id=0x9C4D"
    const entry = data[19]
    expect(entry.level).toBe("ERROR")
    expect(entry.ip).toBe("172.16.99.201")
    expect(entry.status).toBe(500)
    expect(entry.duration_ms).toBe(3018)
    expect(entry.message).toContain("Certificate chain invalid")
    expect(entry.message).toContain("*.cdn.example.net")
  })

  test("high duration values are parsed correctly", () => {
    // Lines with 1876ms, 3644ms, 2233ms, 3018ms
    const highDuration = data.filter((e: any) => e.duration_ms > 1000)
    expect(highDuration.length).toBe(4)
  })
})
