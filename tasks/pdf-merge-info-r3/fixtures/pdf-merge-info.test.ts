import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const info = existsSync("pdf_info.json") ? JSON.parse(readFileSync("pdf_info.json", "utf-8")) : {}

describe("files", () => {
  test("merged.pdf exists", () => {
    expect(existsSync("merged.pdf")).toBe(true)
  })

  test("pdf_info.json exists", () => {
    expect(existsSync("pdf_info.json")).toBe(true)
  })
})

describe("page counts", () => {
  test("merged_page_count is 6", () => {
    expect(info.merged_page_count).toBe(6)
  })

  test("doc_a pages is 2", () => {
    const docA = info.source_files?.find((f: any) => f.filename?.includes("doc_a"))
    expect(docA).toBeDefined()
    expect(docA.page_count).toBe(2)
  })

  test("doc_b pages is 4", () => {
    const docB = info.source_files?.find((f: any) => f.filename?.includes("doc_b"))
    expect(docB).toBeDefined()
    expect(docB.page_count).toBe(4)
  })
})

describe("titles", () => {
  test("doc_a_title contains Field", () => {
    expect(info.doc_a_title).toContain("Field")
  })

  test("doc_b_title contains Deployment", () => {
    expect(info.doc_b_title).toContain("Deployment")
  })
})

describe("authors", () => {
  test("doc_a_author is Hannah Bergstrom", () => {
    expect(info.doc_a_author).toBe("Hannah Bergstrom")
  })

  test("doc_b_author is Marcus Webb", () => {
    expect(info.doc_b_author).toBe("Marcus Webb")
  })
})
