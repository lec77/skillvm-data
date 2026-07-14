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

  test("doc_a pages is 3", () => {
    const docA = info.source_files?.find((f: any) => f.filename?.includes("doc_a"))
    expect(docA).toBeDefined()
    expect(docA.page_count).toBe(3)
  })

  test("doc_b pages is 2", () => {
    const docB = info.source_files?.find((f: any) => f.filename?.includes("doc_b"))
    expect(docB).toBeDefined()
    expect(docB.page_count).toBe(2)
  })
})

describe("titles", () => {
  test("doc_a_title contains Roadmap", () => {
    expect(info.doc_a_title).toContain("Roadmap")
  })

  test("doc_b_title contains Security", () => {
    expect(info.doc_b_title).toContain("Security")
  })
})

describe("authors", () => {
  test("doc_a_author is Carlos Mendes", () => {
    expect(info.doc_a_author).toBe("Carlos Mendes")
  })

  test("doc_b_author is Priya Raman", () => {
    expect(info.doc_b_author).toBe("Priya Raman")
  })
})
