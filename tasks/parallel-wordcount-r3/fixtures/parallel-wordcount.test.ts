import { expect, test, describe } from "bun:test"
import { readFileSync, existsSync } from "fs"

const REFERENCE_COUNTS: Record<string, number> = {"gene":112,"carbon":107,"fossil":121,"volt":109,"signal":117,"quark":120,"charge":92,"sensor":105,"beam":117,"mole":110,"joule":115,"magma":112,"error":136,"alloy":129,"photon":127,"atom":106,"gas":113,"neuron":115,"ray":113,"organ":118,"neutron":104,"plasma":100,"hertz":100,"cable":120,"tensor":123,"node":111,"fusion":96,"tissue":125,"orbit":108,"nucleus":96,"theory":103,"acid":103,"graph":95,"genome":120,"heat":114,"gravity":115,"dose":111,"spin":112,"crater":103,"phase":101,"sample":120,"probe":102,"force":108,"isotope":122,"data":113,"polymer":103,"quasar":107,"result":99,"cell":121,"cortex":101,"filter":106,"radius":131,"laser":80,"nebula":128,"decay":122,"protein":117,"pulsar":109,"mass":110,"meteor":116,"enzyme":121,"argon":107,"ion":112,"quantum":111,"curve":121,"virus":127,"watt":110,"flux":105,"scalar":115,"cosmos":100,"helium":112,"ohm":122,"torque":96,"planet":102,"oxygen":105,"crystal":98,"salt":110,"energy":117,"noise":123,"vector":115,"pulse":123,"entropy":105,"matrix":96,"prism":113,"lens":99,"model":109,"galaxy":120,"comet":111,"metal":103,"circuit":104,"method":119}

const TOP_10_WORDS = ["error","radius","alloy","nebula","photon","virus","tissue","tensor","noise","pulse"]

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
  test("top word is 'error' with count 136", () => {
    expect(data["error"]).toBe(136)
  })

  test("second word is 'radius' with count 131", () => {
    expect(data["radius"]).toBe(131)
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
