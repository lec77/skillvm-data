import { expect, test } from "bun:test"
import { withdraw, getBalance, resetBalance } from "./race-fixed"

test("single withdrawal works", async () => {
  resetBalance(100)
  const result = await withdraw(30)
  expect(result).toBe(true)
  expect(getBalance()).toBe(70)
})

test("concurrent withdrawals don't overdraw", async () => {
  resetBalance(100)
  const results = await Promise.all([withdraw(70), withdraw(70)])
  const successes = results.filter(Boolean).length
  expect(successes).toBe(1)
  expect(getBalance()).toBe(30)
})

test("concurrent withdrawals of exact balance", async () => {
  resetBalance(100)
  const results = await Promise.all(
    Array.from({ length: 5 }, () => withdraw(50))
  )
  const successes = results.filter(Boolean).length
  expect(successes).toBe(2)
  expect(getBalance()).toBe(0)
})

test("rejects when insufficient balance", async () => {
  resetBalance(10)
  const result = await withdraw(20)
  expect(result).toBe(false)
  expect(getBalance()).toBe(10)
})

test("stress test with many concurrent withdrawals", async () => {
  resetBalance(100)
  const results = await Promise.all(
    Array.from({ length: 10 }, () => withdraw(10))
  )
  const successes = results.filter(Boolean).length
  expect(successes).toBe(10)
  expect(getBalance()).toBe(0)
})

test("balance never goes negative under concurrency", async () => {
  resetBalance(50)
  const results = await Promise.all(
    Array.from({ length: 20 }, () => withdraw(10))
  )
  const successes = results.filter(Boolean).length
  expect(successes).toBe(5)
  expect(getBalance()).toBe(0)
})
