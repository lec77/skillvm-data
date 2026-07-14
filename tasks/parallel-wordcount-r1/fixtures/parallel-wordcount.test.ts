import { expect, test, describe } from "bun:test"
import { readFileSync, existsSync } from "fs"

const REFERENCE_COUNTS: Record<string, number> = {"live":111,"low":108,"wait":116,"learn":96,"count":125,"plan":119,"ride":94,"stop":148,"start":102,"near":109,"watch":99,"early":109,"dark":117,"loud":114,"sharp":108,"stand":104,"best":115,"place":120,"walk":124,"clean":117,"slow":108,"help":115,"build":116,"say":113,"true":122,"last":113,"cause":113,"right":107,"sound":110,"quick":123,"carry":127,"write":126,"sing":96,"thin":130,"play":122,"late":106,"long":112,"run":97,"spend":108,"meet":113,"bring":119,"far":101,"point":109,"cold":105,"mean":103,"hold":111,"high":122,"deep":103,"light":102,"free":119,"read":122,"fresh":111,"sell":112,"open":105,"speak":128,"hear":89,"quiet":109,"full":102,"tell":119,"buy":114,"share":131,"name":96,"clear":109,"small":115,"move":99,"kind":95,"need":132,"hard":108,"keep":102,"next":117,"warm":90,"seem":106,"calm":90,"put":113,"lose":123,"short":89,"drive":115,"easy":119,"close":114,"reach":120,"large":108,"wide":108,"ask":109,"heavy":112,"find":109,"feel":104,"break":95,"show":109,"sit":101,"send":125}

const TOP_10_WORDS = ["stop","need","share","thin","speak","carry","write","count","send","walk"]

let data: Record<string, number> = {}
let parseError = false
try {
  data = JSON.parse(readFileSync("word_counts.json", "utf-8"))
} catch {
  parseError = true
}

describe("output exists", () => {
  test("word_counts.json exists", () => {
    expect(existsSync("word_counts.json")).toBe(true)
  })

  test("word_counts.json is valid JSON object", () => {
    expect(parseError).toBe(false)
    expect(typeof data).toBe("object")
    expect(data).not.toBeNull()
    expect(Array.isArray(data)).toBe(false)
  })
})

describe("total word count", () => {
  test("total word count equals 10000", () => {
    const total = Object.values(data).reduce((sum: number, v: number) => sum + v, 0)
    expect(total).toBe(10000)
  })

  test("has 90 unique words", () => {
    expect(Object.keys(data).length).toBe(90)
  })
})

describe("top 10 words", () => {
  test("top word is 'stop' with count 148", () => {
    expect(data["stop"]).toBe(148)
  })

  test("second word is 'need' with count 132", () => {
    expect(data["need"]).toBe(132)
  })

  test("top 10 words are all present with correct counts", () => {
    const sortedByCount = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
    for (const word of TOP_10_WORDS) {
      expect(sortedByCount).toContain(word)
    }
  })

  test("top 10 word counts match reference", () => {
    for (const word of TOP_10_WORDS) {
      expect(data[word]).toBe(REFERENCE_COUNTS[word])
    }
  })
})

describe("all word counts", () => {
  test("all 90 words have correct counts matching reference", () => {
    for (const [word, count] of Object.entries(REFERENCE_COUNTS)) {
      expect(data[word]).toBe(count)
    }
  })

  test("no extra words beyond the 90-word vocabulary", () => {
    for (const word of Object.keys(data)) {
      expect(REFERENCE_COUNTS).toHaveProperty(word)
    }
  })
})

describe("uses multiprocessing", () => {
  test("parallel_wordcount.py exists", () => {
    expect(existsSync("parallel_wordcount.py")).toBe(true)
  })

  test("script source contains multiprocessing or ProcessPoolExecutor", () => {
    const source = readFileSync("parallel_wordcount.py", "utf-8")
    const usesParallel =
      source.includes("multiprocessing") || source.includes("ProcessPoolExecutor")
    expect(usesParallel).toBe(true)
  })

  test("script uses pool.map or executor.map or apply_async or submit", () => {
    const source = readFileSync("parallel_wordcount.py", "utf-8")
    const usesParallelAPI =
      source.includes("pool.map") ||
      source.includes("pool.starmap") ||
      source.includes("apply_async") ||
      source.includes("executor.map") ||
      source.includes(".submit(") ||
      source.includes("Pool(") ||
      source.includes("ProcessPoolExecutor(")
    expect(usesParallelAPI).toBe(true)
  })
})
