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
    expect(ips.has("198.51.100.7")).toBe(true)
    expect(ips.has("10.10.4.201")).toBe(true)
    expect(ips.has("192.0.2.88")).toBe(true)
    expect(ips.has("172.31.255.12")).toBe(true)
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
    expect(first.timestamp).toBe("2026-03-02 14:05:11")
    expect(first.level).toBe("INFO")
    expect(first.ip).toBe("198.51.100.7")
    expect(first.method).toBe("GET")
    expect(first.path).toBe("/v2/accounts")
    expect(first.status).toBe(200)
    expect(first.duration_ms).toBe(52)
  })

  test("entry with error message is parsed correctly", () => {
    const second = data[1]
    expect(second.timestamp).toBe("2026-03-02 14:05:12")
    expect(second.level).toBe("ERROR")
    expect(second.ip).toBe("10.10.4.201")
    expect(second.method).toBe("POST")
    expect(second.path).toBe("/v2/auth/token")
    expect(second.status).toBe(401)
    expect(second.duration_ms).toBe(19)
    expect(second.message).toBe("Token signature mismatch")
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
    // Line 16: GET /v2/lookup?term=blue+sky&limit=25
    const entry = data[15]
    expect(entry.path).toBe("/v2/lookup")
    expect(entry.method).toBe("GET")
    expect(entry.status).toBe(200)
    expect(entry.duration_ms).toBe(91)
  })

  test("error message with escaped quotes is parsed", () => {
    // Line 17: "Replica \"shard-west\" refused writes"
    const entry = data[16]
    expect(entry.level).toBe("ERROR")
    expect(entry.status).toBe(500)
    expect(entry.duration_ms).toBe(4318)
    expect(entry.message).toContain("shard-west")
    expect(entry.message).toContain("refused writes")
  })

  test("second path with query string strips query params", () => {
    // Line 18: GET /v2/flags?stage=canary&trace=true&rev=7
    const entry = data[17]
    expect(entry.path).toBe("/v2/flags")
    expect(entry.level).toBe("WARN")
    expect(entry.status).toBe(304)
  })

  test("error message with special characters is parsed", () => {
    // Line 20: "TLS handshake failed: SAN=*.corp.internal, code=0x3F7C"
    const entry = data[19]
    expect(entry.level).toBe("ERROR")
    expect(entry.ip).toBe("198.51.100.7")
    expect(entry.status).toBe(500)
    expect(entry.duration_ms).toBe(2905)
    expect(entry.message).toContain("TLS handshake failed")
    expect(entry.message).toContain("*.corp.internal")
  })

  test("high duration values are parsed correctly", () => {
    // Lines with 1284ms, 2447ms, 4318ms, 2905ms
    const highDuration = data.filter((e: any) => e.duration_ms > 1000)
    expect(highDuration.length).toBe(4)
  })
})
