import { expect, test, describe } from "bun:test"
import { readFileSync, existsSync, readdirSync } from "fs"
import path from "path"

const logPath = "rename_log.json"
const dir = path.join(process.cwd(), "messy_files")

// Expected mappings: original name -> kebab-case name
const expectedMappings: Record<string, string> = {
  "Agenda (Final).txt": "agenda-final.txt",
  "review_COMMENTS 2024.md": "review-comments-2024.md",
  "signals[v5].csv": "signals-v5.csv",
  "My Contract (Signed).pdf": "my-contract-signed.pdf",
  "MARKETING  Brief.docx": "marketing-brief.docx",
  "unit_TESTS_Final (3).json": "unit-tests-final-3.json",
  "Payroll   Sheet[2024].xlsx": "payroll-sheet-2024.xlsx",
  "install   steps.txt": "install-steps.txt",
  "HOTFIX (v1.7).md": "hotfix-v1.7.md",
  "logger_SETUP.yaml": "logger-setup.yaml",
  "Picture (wedding) SUNSET.jpg": "picture-wedding-sunset.jpg",
  "ADMIN_Tokens [export].json": "admin-tokens-export.json",
}

describe("rename_log.json validation", () => {
  test("rename_log.json exists", () => {
    expect(existsSync(logPath)).toBe(true)
  })

  test("has all 12 mappings", () => {
    const log = JSON.parse(readFileSync(logPath, "utf-8"))
    expect(Object.keys(log).length).toBe(12)
  })

  test("maps old names to new kebab-case names", () => {
    const log = JSON.parse(readFileSync(logPath, "utf-8"))
    for (const [oldName, newName] of Object.entries(expectedMappings)) {
      expect(log[oldName]).toBe(newName)
    }
  })
})

describe("file system validation", () => {
  test("renamed files exist on disk", () => {
    const filesOnDisk = readdirSync(dir)
    const expectedNew = Object.values(expectedMappings)
    let found = 0
    for (const expected of expectedNew) {
      if (filesOnDisk.includes(expected)) found++
    }
    // All 12 renamed files should exist
    expect(found).toBe(12)
  })

  test("all files follow kebab-case naming", () => {
    const filesOnDisk = readdirSync(dir)
    for (const file of filesOnDisk) {
      const nameWithoutExt = file.replace(/\.[^.]+$/, "")
      // Kebab-case: lowercase, only letters/numbers/hyphens/dots allowed
      expect(nameWithoutExt).toMatch(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$|^[a-z0-9]$/)
      // No uppercase letters
      expect(file).toBe(file.toLowerCase())
      // No spaces, underscores, parentheses, or brackets
      expect(file).not.toMatch(/[\s_()[\]]/)
      // No consecutive hyphens
      expect(file).not.toMatch(/--/)
    }
  })

  test("no original files remain", () => {
    const filesOnDisk = readdirSync(dir)
    const originals = Object.keys(expectedMappings)
    for (const original of originals) {
      // Only check if the original differs from the new name
      const newName = expectedMappings[original]
      if (original !== newName) {
        expect(filesOnDisk).not.toContain(original)
      }
    }
  })
})
