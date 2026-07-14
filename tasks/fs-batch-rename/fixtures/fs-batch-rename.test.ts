import { expect, test, describe } from "bun:test"
import { readFileSync, existsSync, readdirSync } from "fs"
import path from "path"

const logPath = "rename_log.json"
const dir = path.join(process.cwd(), "messy_files")

// Expected mappings: original name -> kebab-case name
const expectedMappings: Record<string, string> = {
  "Report (Final).txt": "report-final.txt",
  "meeting_NOTES 2026.md": "meeting-notes-2026.md",
  "data[v2].csv": "data-v2.csv",
  "My Resume (Updated).pdf": "my-resume-updated.pdf",
  "PROJECT  Plan.docx": "project-plan.docx",
  "test_RESULTS_Final (1).json": "test-results-final-1.json",
  "Budget   Forecast[2026].xlsx": "budget-forecast-2026.xlsx",
  "user   guide.txt": "user-guide.txt",
  "CHANGELOG (v3.1).md": "changelog-v3.1.md",
  "config_FILE.yaml": "config-file.yaml",
  "Photo (vacation) BEACH.jpg": "photo-vacation-beach.jpg",
  "API_Response [raw].json": "api-response-raw.json",
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
