import { expect, test, describe } from "bun:test"
import { readFileSync, existsSync } from "fs"

const REFERENCE_COUNTS: Record<string, number> = {"them":112,"to":104,"my":111,"by":91,"its":118,"than":108,"even":95,"that":109,"which":125,"from":102,"no":112,"this":109,"see":128,"take":121,"your":104,"use":116,"the":114,"now":128,"so":108,"with":124,"give":112,"have":135,"work":115,"good":114,"come":111,"know":111,"day":127,"about":119,"how":110,"some":121,"first":115,"into":109,"look":126,"and":102,"would":113,"it":123,"all":108,"out":102,"if":117,"but":100,"any":100,"do":115,"as":95,"us":120,"people":104,"then":124,"our":102,"also":96,"their":124,"well":117,"who":104,"want":100,"make":110,"will":101,"an":115,"year":108,"could":109,"after":118,"a":108,"him":105,"be":87,"only":104,"for":116,"me":108,"when":118,"these":108,"at":123,"think":113,"back":109,"what":117,"because":106,"way":100,"there":136,"like":107,"in":125,"not":120,"can":115,"go":92,"just":93,"new":101,"or":92,"most":106,"get":103,"over":113,"two":119,"other":122,"on":120,"time":118,"up":103,"of":102}

const TOP_10_WORDS = ["there","have","see","now","day","look","which","in","with","then"]

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
  test("top word is 'there' with count 136", () => {
    expect(data["there"]).toBe(136)
  })

  test("second word is 'have' with count 135", () => {
    expect(data["have"]).toBe(135)
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
