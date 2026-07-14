import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const report = existsSync("detection_report.json") ? JSON.parse(readFileSync("detection_report.json", "utf-8")) : {}

describe("detection_report.json", () => {
  test("exists", () => {
    expect(existsSync("detection_report.json")).toBe(true)
  })
})

describe("report structure", () => {
  test("paragraph_count is 4", () => {
    expect(report.paragraph_count).toBe(4)
  })

  test("has patterns_found array", () => {
    expect(Array.isArray(report.patterns_found)).toBe(true)
    expect(report.patterns_found.length).toBeGreaterThanOrEqual(4)
  })

  test("has ai_probability", () => {
    expect(typeof report.ai_probability).toBe("number")
  })

  test("has total_pattern_count", () => {
    expect(typeof report.total_pattern_count).toBe("number")
  })
})

describe("filler phrase detection", () => {
  const fillerPattern = report.patterns_found?.find((p: any) =>
    p.pattern_name?.toLowerCase().includes("filler")
  )

  test("filler_phrases pattern found", () => {
    expect(fillerPattern).toBeDefined()
  })

  test("important to note detected", () => {
    const allExamples = report.patterns_found?.flatMap((p: any) => p.examples || []).join(" ").toLowerCase() || ""
    expect(allExamples).toContain("important to note")
  })

  test("worth noting detected", () => {
    const allExamples = report.patterns_found?.flatMap((p: any) => p.examples || []).join(" ").toLowerCase() || ""
    expect(allExamples).toContain("worth noting")
  })
})

describe("AI vocabulary detection", () => {
  const vocabPattern = report.patterns_found?.find((p: any) =>
    p.pattern_name?.toLowerCase().includes("vocab")
  )

  test("ai_vocabulary pattern found", () => {
    expect(vocabPattern).toBeDefined()
  })

  test("delving detected in examples", () => {
    const allExamples = report.patterns_found?.flatMap((p: any) => p.examples || []).join(" ").toLowerCase() || ""
    expect(allExamples).toContain("delving")
  })

  test("tapestry detected in examples", () => {
    const allExamples = report.patterns_found?.flatMap((p: any) => p.examples || []).join(" ").toLowerCase() || ""
    expect(allExamples).toContain("tapestry")
  })

  test("landscape detected in examples", () => {
    const allExamples = report.patterns_found?.flatMap((p: any) => p.examples || []).join(" ").toLowerCase() || ""
    expect(allExamples).toContain("landscape")
  })
})

describe("artifact and promotional detection", () => {
  test("chatbot_artifacts pattern found", () => {
    const pattern = report.patterns_found?.find((p: any) =>
      p.pattern_name?.toLowerCase().includes("chatbot") || p.pattern_name?.toLowerCase().includes("artifact")
    )
    expect(pattern).toBeDefined()
  })

  test("As an AI detected", () => {
    const allExamples = report.patterns_found?.flatMap((p: any) => p.examples || []).join(" ") || ""
    expect(allExamples.toLowerCase()).toContain("as an ai")
  })

  test("promotional language pattern found", () => {
    const pattern = report.patterns_found?.find((p: any) =>
      p.pattern_name?.toLowerCase().includes("promotional") || p.pattern_name?.toLowerCase().includes("hype")
    )
    expect(pattern).toBeDefined()
  })

  test("cutting-edge detected", () => {
    const allExamples = report.patterns_found?.flatMap((p: any) => p.examples || []).join(" ").toLowerCase() || ""
    expect(allExamples).toContain("cutting-edge")
  })

  test("groundbreaking detected", () => {
    const allExamples = report.patterns_found?.flatMap((p: any) => p.examples || []).join(" ").toLowerCase() || ""
    expect(allExamples).toContain("groundbreaking")
  })
})

describe("scoring", () => {
  test("probability above 0.8", () => {
    expect(report.ai_probability).toBeGreaterThan(0.8)
  })

  test("pattern count is at least 10", () => {
    expect(report.total_pattern_count).toBeGreaterThanOrEqual(10)
  })
})
