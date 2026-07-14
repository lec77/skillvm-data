import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

interface ClosestPair {
  city1: string
  city2: string
  distance_km: number
}

interface Distances {
  matrix: number[][]
  closest_pairs: ClosestPair[]
}

function loadDistances(): Distances {
  const raw = readFileSync("distances.json", "utf-8")
  return JSON.parse(raw)
}

// Pre-computed expected values (Haversine, R=6371 km):
// CSV order: Tokyo, New York, London, Paris, Sydney, Cairo, Mumbai, São Paulo, Moscow, Dubai, Beijing, Los Angeles, Singapore, Cape Town, Mexico City
// London (index 2): 51.5074°N, -0.1278°E
// Paris (index 3): 48.8566°N, 2.3522°E
// London-Paris distance: ~343.56 km (indices 2,3)
// Mumbai-Dubai distance: ~1935.09 km (indices 6,9)
// Tokyo-Beijing distance: ~2089.39 km (indices 0,10)

describe("distances.json", () => {
  test("output exists and is valid JSON", () => {
    expect(existsSync("distances.json")).toBe(true)
    const raw = readFileSync("distances.json", "utf-8")
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test("matrix is 15x15", () => {
    const data = loadDistances()
    expect(data.matrix).toBeDefined()
    expect(Array.isArray(data.matrix)).toBe(true)
    expect(data.matrix.length).toBe(15)
    for (const row of data.matrix) {
      expect(Array.isArray(row)).toBe(true)
      expect(row.length).toBe(15)
    }
  })

  test("diagonal zero for all 15 cities", () => {
    const data = loadDistances()
    for (let i = 0; i < 15; i++) {
      expect(Math.abs(Number(data.matrix[i][i]))).toBeLessThan(0.001)
    }
  })

  test("matrix symmetric within tolerance", () => {
    const data = loadDistances()
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        expect(Math.abs(Number(data.matrix[i][j]) - Number(data.matrix[j][i]))).toBeLessThan(1)
      }
    }
  })

  test("closest pair is London-Paris at ~343.56 km", () => {
    const data = loadDistances()
    expect(data.closest_pairs).toBeDefined()
    expect(Array.isArray(data.closest_pairs)).toBe(true)
    expect(data.closest_pairs.length).toBeGreaterThanOrEqual(1)

    const first = data.closest_pairs[0]
    const cities = [first.city1, first.city2]
    expect(cities).toContain("London")
    expect(cities).toContain("Paris")
    expect(Math.abs(Number(first.distance_km) - 343.5560603410416)).toBeLessThan(5)
  })

  test("all off-diagonal distances positive", () => {
    const data = loadDistances()
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (i !== j) {
          expect(Number(data.matrix[i][j])).toBeGreaterThan(0)
        }
      }
    }
  })

  test("second closest pair is Mumbai-Dubai at ~1935 km", () => {
    const data = loadDistances()
    expect(data.closest_pairs.length).toBeGreaterThanOrEqual(2)

    const second = data.closest_pairs[1]
    const cities = [second.city1, second.city2]
    expect(cities).toContain("Mumbai")
    expect(cities).toContain("Dubai")
    expect(Math.abs(Number(second.distance_km) - 1935.089719184642)).toBeLessThan(5)
  })
})
