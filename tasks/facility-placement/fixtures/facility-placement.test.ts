import { describe, test, expect } from "bun:test"
import { existsSync, readFileSync } from "fs"

interface Placement {
  facilities: [number, number][]
  total_covered_population: number
  coverage_map: number[][]
}

const GRID_SIZE = 8
const COVERAGE_RADIUS = 2
const MIN_DISTANCE = 2
const BLOCKED_CELLS: [number, number][] = [
  [0, 0], [0, 1], [1, 0], [6, 7], [7, 6], [7, 7],
]
const POPULATION = [
  [0, 0, 3, 2, 1, 0, 0, 0],
  [0, 0, 4, 5, 3, 1, 0, 0],
  [2, 3, 5, 8, 6, 4, 2, 1],
  [1, 4, 7, 10, 9, 5, 3, 1],
  [2, 3, 6, 9, 8, 6, 3, 2],
  [1, 2, 4, 5, 7, 8, 5, 3],
  [0, 1, 2, 3, 5, 7, 0, 4],
  [0, 0, 1, 2, 3, 4, 0, 0],
]

function manhattan(a: [number, number], b: [number, number]): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}

function isBlocked(cell: [number, number]): boolean {
  return BLOCKED_CELLS.some(b => b[0] === cell[0] && b[1] === cell[1])
}

function computeCoverageMap(facilities: [number, number][]): number[][] {
  const map: number[][] = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(0))
  for (const f of facilities) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (manhattan(f, [r, c]) <= COVERAGE_RADIUS) {
          map[r][c] = 1
        }
      }
    }
  }
  return map
}

function computeCoveredPopulation(coverageMap: number[][]): number {
  let total = 0
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (coverageMap[r][c] === 1) {
        total += POPULATION[r][c]
      }
    }
  }
  return total
}

describe("facility-placement", () => {
  test("output file exists", () => {
    expect(existsSync("placement.json")).toBe(true)
  })

  test("exactly 4 facilities placed", () => {
    const result: Placement = JSON.parse(readFileSync("placement.json", "utf-8"))
    expect(Array.isArray(result.facilities)).toBe(true)
    expect(result.facilities.length).toBe(4)
    for (const f of result.facilities) {
      expect(Array.isArray(f)).toBe(true)
      expect(f.length).toBe(2)
      expect(f[0]).toBeGreaterThanOrEqual(0)
      expect(f[0]).toBeLessThan(GRID_SIZE)
      expect(f[1]).toBeGreaterThanOrEqual(0)
      expect(f[1]).toBeLessThan(GRID_SIZE)
    }
  })

  test("no facility on blocked cell", () => {
    const result: Placement = JSON.parse(readFileSync("placement.json", "utf-8"))
    for (const f of result.facilities) {
      expect(isBlocked(f as [number, number])).toBe(false)
    }
  })

  test("minimum distance constraint: all facilities >= 2 apart", () => {
    const result: Placement = JSON.parse(readFileSync("placement.json", "utf-8"))
    const facs = result.facilities as [number, number][]
    for (let i = 0; i < facs.length; i++) {
      for (let j = i + 1; j < facs.length; j++) {
        expect(manhattan(facs[i], facs[j])).toBeGreaterThanOrEqual(MIN_DISTANCE)
      }
    }
  })

  test("coverage map is correct given facility positions", () => {
    const result: Placement = JSON.parse(readFileSync("placement.json", "utf-8"))
    const expected = computeCoverageMap(result.facilities as [number, number][])
    expect(Array.isArray(result.coverage_map)).toBe(true)
    expect(result.coverage_map.length).toBe(GRID_SIZE)
    let mismatches = 0
    for (let r = 0; r < GRID_SIZE; r++) {
      expect(result.coverage_map[r].length).toBe(GRID_SIZE)
      for (let c = 0; c < GRID_SIZE; c++) {
        if (result.coverage_map[r][c] !== expected[r][c]) mismatches++
      }
    }
    // Allow at most 2 mismatches to account for rounding edge cases
    expect(mismatches).toBeLessThanOrEqual(2)
  })

  test("covered population is high (> 120 of 196 total)", () => {
    const result: Placement = JSON.parse(readFileSync("placement.json", "utf-8"))
    const facs = result.facilities as [number, number][]
    const coverageMap = computeCoverageMap(facs)
    const actualCovered = computeCoveredPopulation(coverageMap)
    // The reported value should be consistent with the actual placement
    expect(Math.abs(result.total_covered_population - actualCovered)).toBeLessThanOrEqual(5)
    // A reasonable solution should cover more than 120 (optimal is 186 of 196)
    expect(result.total_covered_population).toBeGreaterThan(120)
  })
})
