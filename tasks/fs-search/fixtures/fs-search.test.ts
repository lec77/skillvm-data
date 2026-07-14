import { expect, test, describe } from "bun:test"
import { readFileSync, existsSync } from "fs"

const filePath = "search_results.json"

describe("search_results.json structure", () => {
  test("file exists", () => {
    expect(existsSync(filePath)).toBe(true)
  })

  test("has all required fields", () => {
    const data = JSON.parse(readFileSync(filePath, "utf-8"))
    expect(data).toHaveProperty("total_files")
    expect(data).toHaveProperty("by_extension")
    expect(data).toHaveProperty("largest_file")
    expect(data).toHaveProperty("files_containing_TODO")
    expect(data).toHaveProperty("nested_depth")
  })
})

describe("file counting", () => {
  test("total_files is correct", () => {
    const data = JSON.parse(readFileSync(filePath, "utf-8"))
    // 20 files total in the project/ directory
    expect(data.total_files).toBe(20)
  })

  test("by_extension counts are correct", () => {
    const data = JSON.parse(readFileSync(filePath, "utf-8"))
    const ext = data.by_extension
    // .ts files: index.ts, app.ts, src/server.ts, src/router.ts, src/utils/format.ts,
    //   src/utils/validate.ts, src/utils/helpers/string.ts, src/utils/helpers/math.ts,
    //   tests/server.test.ts, tests/utils.test.ts = 10
    expect(ext[".ts"]).toBe(10)
    // .json files: package.json, tsconfig.json, config/default.json, config/big-config.json = 4
    expect(ext[".json"]).toBe(4)
    // .md files: README.md, docs/guide.md, docs/api/endpoints.md = 3
    expect(ext[".md"]).toBe(3)
    // .txt files: docs/api/auth.txt, notes.txt = 2
    expect(ext[".txt"]).toBe(2)
    // .gitignore has no extension or extension is "" — count it however the agent does
    // We check the main ones above; total keys should be at least 4
    expect(Object.keys(ext).length).toBeGreaterThanOrEqual(4)
  })
})

describe("largest file detection", () => {
  test("largest_file is big-config.json", () => {
    const data = JSON.parse(readFileSync(filePath, "utf-8"))
    expect(data.largest_file).toBe("big-config.json")
  })
})

describe("TODO search", () => {
  test("files_containing_TODO has correct entries", () => {
    const data = JSON.parse(readFileSync(filePath, "utf-8"))
    const todos: string[] = data.files_containing_TODO
    expect(Array.isArray(todos)).toBe(true)
    // Files with TODO: app.ts, README.md, utils.test.ts, notes.txt
    expect(todos.length).toBe(4)
    expect(todos).toContain("app.ts")
    expect(todos).toContain("README.md")
    expect(todos).toContain("utils.test.ts")
    expect(todos).toContain("notes.txt")
  })
})

describe("directory depth", () => {
  test("nested_depth is 4", () => {
    const data = JSON.parse(readFileSync(filePath, "utf-8"))
    // project/ = 1, project/src/ = 2, project/src/utils/ = 3, project/src/utils/helpers/ = 4
    expect(data.nested_depth).toBe(4)
  })
})
