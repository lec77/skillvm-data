import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

interface NearestPoint {
  id: number
  name: string
  latitude: number
  longitude: number
}

interface Result {
  nearest_point: NearestPoint
  distance_km: number
  bearing_degrees: number
}

function loadResult(): Result {
  const raw = readFileSync("result.json", "utf-8")
  return JSON.parse(raw)
}

// Pre-computed expected values:
// Earthquake at 35.6762°N, 139.6503°E (near Tokyo)
// Nearest boundary: id=3, Japan Trench South (35.0°N, 142.0°E)
// Haversine distance: ~226.00 km
// Bearing from earthquake to boundary: ~108.75°

describe("result.json", () => {
  test("output exists and is valid JSON", () => {
    expect(existsSync("result.json")).toBe(true)
    const raw = readFileSync("result.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("all required fields are present", () => {
    const result = loadResult()
    expect(result.nearest_point).toBeDefined()
    expect(result.distance_km).toBeDefined()
    expect(result.bearing_degrees).toBeDefined()
    expect(result.nearest_point.id).toBeDefined()
    expect(result.nearest_point.name).toBeDefined()
    expect(result.nearest_point.latitude).toBeDefined()
    expect(result.nearest_point.longitude).toBeDefined()
  })

  test("nearest point ID is 3 (Japan Trench South)", () => {
    const result = loadResult()
    expect(Number(result.nearest_point.id)).toBe(3)
  })

  test("distance correct within 5 km of 226.00 km", () => {
    const result = loadResult()
    const expected = 226.00199337932557
    expect(Math.abs(Number(result.distance_km) - expected)).toBeLessThan(5)
  })

  test("bearing valid range 0-360 degrees", () => {
    const result = loadResult()
    const bearing = Number(result.bearing_degrees)
    expect(bearing).toBeGreaterThanOrEqual(0)
    expect(bearing).toBeLessThanOrEqual(360)
    // Bearing from Tokyo earthquake to Japan Trench South is ~108.75° (east-southeast)
    // Allow generous tolerance since bearing calculation may vary slightly
    expect(Math.abs(bearing - 108.75)).toBeLessThan(10)
  })
})
