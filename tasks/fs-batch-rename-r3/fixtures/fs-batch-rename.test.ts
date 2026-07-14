import { expect, test, describe } from "bun:test"
import { readFileSync, existsSync, readdirSync } from "fs"
import path from "path"

const logPath = "rename_log.json"
const dir = path.join(process.cwd(), "messy_files")

// Expected mappings: original name -> kebab-case name
const expectedMappings: Record<string, string> = {
  "Proposal (Rev2).txt": "proposal-rev2.txt",
  "standup_LOGS 2027.md": "standup-logs-2027.md",
  "traffic[v9].csv": "traffic-v9.csv",
  "My Passport (Scanned).pdf": "my-passport-scanned.pdf",
  "SUPPORT  Runbook.docx": "support-runbook.docx",
  "smoke_CHECKS_Final (4).json": "smoke-checks-final-4.json",
  "Inventory   Count[2027].xlsx": "inventory-count-2027.xlsx",
  "quick   start.txt": "quick-start.txt",
  "PATCH (v4.2).md": "patch-v4.2.md",
  "nginx_CONF.yaml": "nginx-conf.yaml",
  "Snapshot (hiking) FOREST.jpg": "snapshot-hiking-forest.jpg",
  "DEVICE_Registry [backup].json": "device-registry-backup.json",
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
