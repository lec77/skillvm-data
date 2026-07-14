import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const report = existsSync("branch_report.json") ? JSON.parse(readFileSync("branch_report.json", "utf-8")) : {}

describe("branch_report.json", () => {
  test("exists", () => {
    expect(existsSync("branch_report.json")).toBe(true)
  })

  test("has all fields", () => {
    expect(report).toHaveProperty("branches")
    expect(report).toHaveProperty("tags")
    expect(report).toHaveProperty("release_branch_commits")
    expect(report).toHaveProperty("v1_0_message")
    expect(report).toHaveProperty("cherry_picked")
  })
})

describe("branch operations", () => {
  test("branches list contains main and release-1.0", () => {
    expect(report.branches).toContain("main")
    expect(report.branches).toContain("release-1.0")
  })

  test("release-1.0 in branches", () => {
    expect(report.branches).toContain("release-1.0")
  })
})

describe("cherry-pick verification", () => {
  test("cherry_picked is true", () => {
    expect(report.cherry_picked).toBe(true)
  })

  test("release_branch_commits is 3", () => {
    // v0.9 is commit 2, so release-1.0 starts with 2 commits + 1 cherry-picked = 3
    expect(report.release_branch_commits).toBe(3)
  })
})

describe("tag operations", () => {
  test("tags list contains v0.9 and v1.0", () => {
    expect(report.tags).toContain("v0.9")
    expect(report.tags).toContain("v1.0")
  })

  test("v1.0 tag exists in tags", () => {
    expect(report.tags).toContain("v1.0")
  })

  test("v1_0_message is the cherry-picked commit message", () => {
    expect(report.v1_0_message).toBe("Add critical fix")
  })
})
