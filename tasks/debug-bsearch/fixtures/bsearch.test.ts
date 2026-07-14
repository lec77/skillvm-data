import { expect, test } from "bun:test"
import { binarySearch } from "./bsearch"

test("finds element at beginning", () => {
  expect(binarySearch([1, 2, 3, 4, 5], 1)).toBe(0)
})
test("finds element at end", () => {
  expect(binarySearch([1, 2, 3, 4, 5], 5)).toBe(4)
})
test("finds element in middle", () => {
  expect(binarySearch([1, 2, 3, 4, 5], 3)).toBe(2)
})
test("returns -1 for missing element", () => {
  expect(binarySearch([1, 2, 3, 4, 5], 6)).toBe(-1)
})
test("handles single element array", () => {
  expect(binarySearch([42], 42)).toBe(0)
})
test("handles empty array", () => {
  expect(binarySearch([], 1)).toBe(-1)
})
test("handles large array", () => {
  const arr = Array.from({ length: 10000 }, (_, i) => i)
  expect(binarySearch(arr, 9999)).toBe(9999)
  expect(binarySearch(arr, 0)).toBe(0)
  expect(binarySearch(arr, 5000)).toBe(5000)
})
test("returns -1 for target beyond last element", () => {
  expect(binarySearch([10, 20, 30], 40)).toBe(-1)
})
test("returns -1 for target before first element", () => {
  expect(binarySearch([10, 20, 30], 5)).toBe(-1)
})
