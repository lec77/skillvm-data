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
  test("merged_page_count is 5", () => {
    expect(info.merged_page_count).toBe(5)
  })

  test("doc_a pages is 2", () => {
    const docA = info.source_files?.find((f: any) => f.filename?.includes("doc_a"))
    expect(docA).toBeDefined()
    expect(docA.page_count).toBe(2)
  })

  test("doc_b pages is 3", () => {
    const docB = info.source_files?.find((f: any) => f.filename?.includes("doc_b"))
    expect(docB).toBeDefined()
    expect(docB.page_count).toBe(3)
  })
})

describe("titles", () => {
  test("doc_a_title contains Research", () => {
    expect(info.doc_a_title).toContain("Research")
  })

  test("doc_b_title contains Migration", () => {
    expect(info.doc_b_title).toContain("Migration")
  })
})

describe("authors", () => {
  test("doc_a_author is Alice Nguyen", () => {
    expect(info.doc_a_author).toBe("Alice Nguyen")
  })

  test("doc_b_author is Robert Kim", () => {
    expect(info.doc_b_author).toBe("Robert Kim")
  })
})
