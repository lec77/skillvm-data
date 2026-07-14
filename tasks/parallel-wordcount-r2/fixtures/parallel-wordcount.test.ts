import { expect, test, describe } from "bun:test"
import { readFileSync, existsSync } from "fs"

const REFERENCE_COUNTS: Record<string, number> = {"thistle":91,"seed":111,"wind":107,"moth":97,"sky":115,"cave":108,"tide":119,"shell":110,"wood":109,"oak":103,"pine":115,"glade":115,"pond":91,"gorge":107,"cliff":121,"fern":130,"quartz":115,"drift":118,"creek":103,"haze":126,"maple":111,"fire":108,"dusk":128,"rock":114,"aspen":109,"ice":123,"trail":123,"alder":102,"cloud":100,"tree":113,"rain":112,"ridge":115,"dune":116,"fish":109,"moss":132,"mist":98,"ember":120,"hawk":116,"boulder":100,"seal":120,"shore":117,"spring":113,"reef":119,"plain":129,"peak":107,"wave":114,"gravel":131,"hare":112,"deer":107,"leaf":113,"marsh":107,"field":126,"earth":87,"willow":124,"valley":104,"ant":102,"wolf":133,"coast":104,"canyon":81,"storm":111,"frost":114,"path":95,"snow":103,"birch":114,"root":101,"whale":110,"crab":123,"stone":124,"bank":120,"granite":103,"bear":107,"trout":115,"meadow":104,"hill":107,"sand":117,"bird":94,"fox":104,"lake":122,"lichen":107,"bee":109,"dawn":116,"clover":111,"moon":110,"cedar":107,"grass":115,"star":99,"owl":88,"slope":115,"crow":114,"river":111}

const TOP_10_WORDS = ["wolf","moss","gravel","fern","plain","dusk","haze","field","willow","stone"]

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
  test("top word is 'wolf' with count 133", () => {
    expect(data["wolf"]).toBe(133)
  })

  test("second word is 'moss' with count 132", () => {
    expect(data["moss"]).toBe(132)
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
