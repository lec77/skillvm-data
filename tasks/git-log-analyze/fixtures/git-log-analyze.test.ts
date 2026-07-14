import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const report = existsSync("git_report.json") ? JSON.parse(readFileSync("git_report.json", "utf-8")) : {}

describe("git_report.json", () => {
  test("exists", () => {
    expect(existsSync("git_report.json")).toBe(true)
  })
})

describe("basic statistics", () => {
  test("total_commits is 8", () => {
    expect(report.total_commits).toBe(8)
  })

  test("authors list is correct", () => {
    const authors = report.authors
    expect(authors).toBeArrayOfSize(3)
    expect(authors[0]).toBe("Alice")
    expect(authors[1]).toBe("Bob")
    expect(authors[2]).toBe("Carol")
  })

  test("most_active author is Alice", () => {
    // Alice: Initial commit, Add math module, Add version on feature, Merge feature branch, Add subtract function = 5
    // Bob: Add index, Add config = 2
    // Carol: Update readme = 1
    expect(report.most_active_author).toBe("Alice")
  })
})

describe("file tracking", () => {
  test("files_changed count is 5", () => {
    // README.md, index.ts, math.ts, version.ts, config.ts
    expect(report.files_changed).toBe(5)
  })
})

describe("dates", () => {
  test("first_commit_date is 2026-01-10", () => {
    expect(report.first_commit_date).toBe("2026-01-10")
  })

  test("last_commit_date is 2026-01-25", () => {
    expect(report.last_commit_date).toBe("2026-01-25")
  })
})

describe("merge detection", () => {
  test("merge_commits is 1", () => {
    expect(report.merge_commits).toBe(1)
  })
})
