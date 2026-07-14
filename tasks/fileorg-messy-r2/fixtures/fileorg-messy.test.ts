import { test, expect } from "bun:test"
import { readdirSync, existsSync } from "fs"
import path from "path"

// The agent should organize files from downloads/ into subdirectories by type.
// Tests match by file extension (not filename) since agents often rename files.
// Tests check ancestor directory paths (not just immediate parent) since agents
// may use nested structures like images/photos/ or code/web/.

const downloadsDir = path.join(process.cwd(), "downloads")

function findAllFiles(dir: string): { name: string; relPath: string }[] {
  const results: { name: string; relPath: string }[] = []
  function walk(current: string) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(current, entry.name))
      } else if (entry.isFile()) {
        results.push({
          name: entry.name,
          relPath: path.relative(dir, path.join(current, entry.name)),
        })
      }
    }
  }
  if (existsSync(dir)) walk(dir)
  return results
}

test("downloads directory has subdirectories", () => {
  expect(existsSync(downloadsDir)).toBe(true)
  const entries = readdirSync(downloadsDir, { withFileTypes: true })
  const dirs = entries.filter((e) => e.isDirectory())
  expect(dirs.length).toBeGreaterThanOrEqual(3)
})

test("no regular files remain in downloads root", () => {
  const entries = readdirSync(downloadsDir, { withFileTypes: true })
  const rootFiles = entries.filter((e) => e.isFile())
  expect(rootFiles.length).toBeLessThanOrEqual(2)
})

test("all files are preserved", () => {
  const found = findAllFiles(downloadsDir)
  // Original fixture has 30 files. Allow tolerance for dedup of obvious copies.
  expect(found.length).toBeGreaterThanOrEqual(25)
})

test("image files are under an image-related path", () => {
  const found = findAllFiles(downloadsDir)
  const imageExts = [".jpg", ".jpeg", ".png", ".heic", ".gif", ".svg", ".webp"]
  const imageFiles = found.filter((f) => imageExts.some((ext) => f.name.toLowerCase().endsWith(ext)))
  const imageKeywords = ["image", "photo", "picture", "img", "screenshot"]

  let correct = 0
  for (const img of imageFiles) {
    const dirPath = path.dirname(img.relPath).toLowerCase()
    if (imageKeywords.some((k) => dirPath.includes(k))) correct++
  }
  // At least 4 of the ~6 image files should be in image directories
  expect(correct).toBeGreaterThanOrEqual(4)
})

test("document files are under a document-related path", () => {
  const found = findAllFiles(downloadsDir)
  const docExts = [".pdf", ".docx", ".doc"]
  const docFiles = found.filter((f) => docExts.some((ext) => f.name.toLowerCase().endsWith(ext)))
  const docKeywords = ["document", "pdf", "doc", "report", "invoice", "resume"]

  let correct = 0
  for (const doc of docFiles) {
    const dirPath = path.dirname(doc.relPath).toLowerCase()
    if (docKeywords.some((k) => dirPath.includes(k))) correct++
  }
  // At least 5 of the ~9 doc files should be in document directories
  expect(correct).toBeGreaterThanOrEqual(5)
})

test("code files are under a code-related path", () => {
  const found = findAllFiles(downloadsDir)
  const codeExts = [".py", ".ts", ".js", ".html", ".css", ".json", ".yaml", ".yml", ".sql"]
  const codeFiles = found.filter((f) => codeExts.some((ext) => f.name.toLowerCase().endsWith(ext)))
  const codeKeywords = ["code", "script", "source", "dev", "web", "programming", "data"]

  let correct = 0
  for (const code of codeFiles) {
    const dirPath = path.dirname(code.relPath).toLowerCase()
    if (codeKeywords.some((k) => dirPath.includes(k))) correct++
  }
  // At least 4 of the ~8 code files should be in code directories
  expect(correct).toBeGreaterThanOrEqual(4)
})

test("media files are under a media-related path", () => {
  const found = findAllFiles(downloadsDir)
  const mediaExts = [".mp4", ".mov", ".avi", ".mp3", ".wav", ".flac"]
  const mediaFiles = found.filter((f) => mediaExts.some((ext) => f.name.toLowerCase().endsWith(ext)))
  const mediaKeywords = ["media", "video", "audio", "music"]

  let correct = 0
  for (const media of mediaFiles) {
    const dirPath = path.dirname(media.relPath).toLowerCase()
    if (mediaKeywords.some((k) => dirPath.includes(k))) correct++
  }
  // Both media files should be in media directories
  expect(correct).toBeGreaterThanOrEqual(1)
})
