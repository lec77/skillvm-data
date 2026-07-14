import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const raw = existsSync("faq-schema.json") ? readFileSync("faq-schema.json", "utf-8") : "{}"
const data = JSON.parse(raw)

describe("faq-schema.json", () => {
  test("exists", () => {
    expect(existsSync("faq-schema.json")).toBe(true)
  })

  test("is valid JSON", () => {
    expect(() => JSON.parse(raw)).not.toThrow()
  })
})

describe("JSON-LD structure", () => {
  test("has @context schema.org", () => {
    expect(data["@context"]).toMatch(/schema\.org/)
  })

  test("has @type FAQPage", () => {
    expect(data["@type"]).toBe("FAQPage")
  })
})

describe("mainEntity array", () => {
  const questions = data.mainEntity || []

  test("has 5 questions", () => {
    expect(questions).toBeArrayOfSize(5)
  })

  test("each item has @type Question", () => {
    for (const q of questions) {
      expect(q["@type"]).toBe("Question")
    }
  })

  test("each item has name property", () => {
    for (const q of questions) {
      expect(q.name).toBeDefined()
      expect(typeof q.name).toBe("string")
      expect(q.name.length).toBeGreaterThan(0)
    }
  })

  test("each item has acceptedAnswer with @type Answer", () => {
    for (const q of questions) {
      expect(q.acceptedAnswer).toBeDefined()
      expect(q.acceptedAnswer["@type"]).toBe("Answer")
    }
  })

  test("each acceptedAnswer has text content", () => {
    for (const q of questions) {
      expect(q.acceptedAnswer.text).toBeDefined()
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(0)
    }
  })
})

describe("question content", () => {
  const questions = data.mainEntity || []

  test("contains question about what CloudSync Pro is", () => {
    const match = questions.some((q: any) => q.name?.includes("What is CloudSync Pro"))
    expect(match).toBe(true)
  })

  test("contains question about storage", () => {
    const match = questions.some((q: any) => q.name?.toLowerCase().includes("storage"))
    expect(match).toBe(true)
  })

  test("contains question about encryption", () => {
    const match = questions.some((q: any) => q.name?.toLowerCase().includes("encrypt"))
    expect(match).toBe(true)
  })

  test("contains question about sharing", () => {
    const match = questions.some((q: any) => q.name?.toLowerCase().includes("share"))
    expect(match).toBe(true)
  })

  test("contains question about cancellation", () => {
    const match = questions.some((q: any) => q.name?.toLowerCase().includes("cancel"))
    expect(match).toBe(true)
  })

  test("answer about encryption mentions AES-256", () => {
    const q = questions.find((q: any) => q.name?.toLowerCase().includes("encrypt"))
    expect(q?.acceptedAnswer?.text).toMatch(/AES-256/)
  })
})
