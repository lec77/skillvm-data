import { describe, test, expect } from "bun:test"
import { existsSync, readFileSync } from "fs"

interface KnapsackResult {
  selected_items: number[]
  total_weight: number
  total_value: number
  value_per_weight: number
}

const ITEMS: Record<number, { weight: number; value: number }> = {
  1: { weight: 3, value: 150 },
  2: { weight: 15, value: 300 },
  3: { weight: 10, value: 180 },
  4: { weight: 5, value: 120 },
  5: { weight: 20, value: 200 },
  6: { weight: 8, value: 160 },
  7: { weight: 2, value: 90 },
  8: { weight: 4, value: 130 },
  9: { weight: 6, value: 170 },
  10: { weight: 3, value: 110 },
  11: { weight: 12, value: 140 },
  12: { weight: 4, value: 100 },
}
const CAPACITY = 50
// Optimal solution verified by DP: items [1,2,4,6,7,8,9,10,12] = weight 50, value 1330
const OPTIMAL_VALUE = 1330

describe("knapsack-optimize", () => {
  test("output file exists", () => {
    expect(existsSync("knapsack_result.json")).toBe(true)
  })

  test("total weight within capacity of 50", () => {
    const result: KnapsackResult = JSON.parse(readFileSync("knapsack_result.json", "utf-8"))
    expect(Array.isArray(result.selected_items)).toBe(true)
    // Compute actual weight from selected items
    const actualWeight = result.selected_items.reduce((sum, id) => sum + (ITEMS[id]?.weight ?? 0), 0)
    expect(actualWeight).toBeLessThanOrEqual(CAPACITY)
    // Reported weight should match actual
    expect(Math.abs(result.total_weight - actualWeight)).toBeLessThanOrEqual(1)
  })

  test("total value is near-optimal (>= 1200, optimal is 1330)", () => {
    const result: KnapsackResult = JSON.parse(readFileSync("knapsack_result.json", "utf-8"))
    // Compute actual value from selected items
    const actualValue = result.selected_items.reduce((sum, id) => sum + (ITEMS[id]?.value ?? 0), 0)
    // Reported value should match actual
    expect(Math.abs(result.total_value - actualValue)).toBeLessThanOrEqual(1)
    // Solution should be at least 90% of optimal (1330 * 0.9 ≈ 1197, round up to 1200)
    expect(result.total_value).toBeGreaterThanOrEqual(1200)
  })

  test("all item IDs are valid (must be integers 1 through 12)", () => {
    const result: KnapsackResult = JSON.parse(readFileSync("knapsack_result.json", "utf-8"))
    expect(Array.isArray(result.selected_items)).toBe(true)
    expect(result.selected_items.length).toBeGreaterThan(0)
    for (const id of result.selected_items) {
      expect(typeof id).toBe("number")
      expect(Number.isInteger(id)).toBe(true)
      expect(id).toBeGreaterThanOrEqual(1)
      expect(id).toBeLessThanOrEqual(12)
    }
  })

  test("no duplicate item IDs in selection", () => {
    const result: KnapsackResult = JSON.parse(readFileSync("knapsack_result.json", "utf-8"))
    const unique = new Set(result.selected_items)
    expect(unique.size).toBe(result.selected_items.length)
  })

  test("value per weight efficiency is consistent and > 20", () => {
    const result: KnapsackResult = JSON.parse(readFileSync("knapsack_result.json", "utf-8"))
    // Reported ratio should be consistent with reported total_value and total_weight
    if (result.total_weight > 0) {
      const expectedRatio = result.total_value / result.total_weight
      expect(Math.abs(result.value_per_weight - expectedRatio)).toBeLessThan(1)
    }
    // A good solution should have value/weight > 20 (optimal is 26.60)
    expect(result.value_per_weight).toBeGreaterThan(20)
  })
})
