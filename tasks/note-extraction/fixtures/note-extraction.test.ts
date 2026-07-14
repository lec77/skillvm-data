import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

function loadEntities(): any[] {
  const raw = readFileSync("entities.json", "utf-8")
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : parsed.entities ?? []
}

describe("entities.json exists", () => {
  test("entities.json file is present", () => {
    expect(existsSync("entities.json")).toBe(true)
  })

  test("entities.json is a non-empty array", () => {
    const entities = loadEntities()
    expect(Array.isArray(entities)).toBe(true)
    expect(entities.length).toBeGreaterThan(0)
  })
})

describe("at least 15 entities", () => {
  test("at least 15 entities extracted from note", () => {
    const entities = loadEntities()
    expect(entities.length).toBeGreaterThanOrEqual(15)
  })
})

describe("diabetes.*condition|condition.*diabetes", () => {
  test("type 2 diabetes found as condition type, not negated", () => {
    const entities = loadEntities()
    const diabetes = entities.find(
      (e: any) =>
        e.type === "condition" &&
        (e.text ?? e.name ?? "").toLowerCase().includes("diabet")
    )
    expect(diabetes).toBeDefined()
    expect(diabetes.negated).toBe(false)
  })

  test("hypertension found as condition type, not negated", () => {
    const entities = loadEntities()
    const htn = entities.find(
      (e: any) =>
        e.type === "condition" &&
        (e.text ?? e.name ?? "").toLowerCase().includes("hypertension")
    )
    expect(htn).toBeDefined()
    expect(htn.negated).toBe(false)
  })

  test("chest pain found as condition or symptom", () => {
    const entities = loadEntities()
    const cp = entities.find((e: any) =>
      (e.text ?? e.name ?? "").toLowerCase().includes("chest pain")
    )
    expect(cp).toBeDefined()
  })
})

describe("nausea.*negated|negated.*nausea|heart failure.*negated|negated.*heart failure", () => {
  test("nausea found as negated condition", () => {
    const entities = loadEntities()
    const nausea = entities.find(
      (e: any) =>
        (e.text ?? e.name ?? "").toLowerCase().includes("nausea") &&
        e.negated === true
    )
    expect(nausea).toBeDefined()
  })

  test("heart failure found as negated condition", () => {
    const entities = loadEntities()
    const hf = entities.find(
      (e: any) =>
        (e.text ?? e.name ?? "").toLowerCase().includes("heart failure") &&
        e.negated === true
    )
    expect(hf).toBeDefined()
  })

  test("coronary artery disease found as negated condition", () => {
    const entities = loadEntities()
    const cad = entities.find(
      (e: any) =>
        (e.text ?? e.name ?? "").toLowerCase().includes("coronary") &&
        e.negated === true
    )
    expect(cad).toBeDefined()
  })

  test("vomiting found as negated condition", () => {
    const entities = loadEntities()
    const vomiting = entities.find(
      (e: any) =>
        (e.text ?? e.name ?? "").toLowerCase().includes("vomit") &&
        e.negated === true
    )
    expect(vomiting).toBeDefined()
  })
})

describe("Metformin.*medication|medication.*Metformin", () => {
  test("Metformin found as medication type", () => {
    const entities = loadEntities()
    const metformin = entities.find(
      (e: any) =>
        e.type === "medication" &&
        (e.text ?? e.name ?? "").toLowerCase().includes("metformin")
    )
    expect(metformin).toBeDefined()
  })

  test("Metformin has dose information", () => {
    const entities = loadEntities()
    const metformin = entities.find(
      (e: any) =>
        e.type === "medication" &&
        (e.text ?? e.name ?? "").toLowerCase().includes("metformin")
    )
    expect(metformin).toBeDefined()
    const dose = metformin.dose ?? metformin.dosage ?? metformin.amount
    expect(dose).toBeDefined()
    expect(Number(dose)).toBeGreaterThan(0)
  })

  test("Lisinopril found as medication type", () => {
    const entities = loadEntities()
    const lisinopril = entities.find(
      (e: any) =>
        e.type === "medication" &&
        (e.text ?? e.name ?? "").toLowerCase().includes("lisinopril")
    )
    expect(lisinopril).toBeDefined()
  })

  test("Aspirin found as medication type", () => {
    const entities = loadEntities()
    const aspirin = entities.find(
      (e: any) =>
        e.type === "medication" &&
        (e.text ?? e.name ?? "").toLowerCase().includes("aspirin")
    )
    expect(aspirin).toBeDefined()
  })
})

describe("Troponin.*lab_result|lab_result.*Troponin", () => {
  test("Troponin found as lab_result type", () => {
    const entities = loadEntities()
    const troponin = entities.find(
      (e: any) =>
        e.type === "lab_result" &&
        (e.text ?? e.name ?? "").toLowerCase().includes("troponin")
    )
    expect(troponin).toBeDefined()
  })

  test("Troponin has a numeric value", () => {
    const entities = loadEntities()
    const troponin = entities.find(
      (e: any) =>
        e.type === "lab_result" &&
        (e.text ?? e.name ?? "").toLowerCase().includes("troponin")
    )
    expect(troponin).toBeDefined()
    const val = troponin.value ?? troponin.result ?? troponin.result_value
    expect(val).toBeDefined()
    expect(Number(val)).toBeCloseTo(0.04, 2)
  })

  test("Creatinine found as lab_result with value", () => {
    const entities = loadEntities()
    const creatinine = entities.find(
      (e: any) =>
        e.type === "lab_result" &&
        (e.text ?? e.name ?? "").toLowerCase().includes("creatinine")
    )
    expect(creatinine).toBeDefined()
    const val = creatinine.value ?? creatinine.result ?? creatinine.result_value
    expect(Math.abs(Number(val) - 1.3)).toBeLessThan(0.05)
  })

  test("Glucose found as lab_result with value", () => {
    const entities = loadEntities()
    const glucose = entities.find(
      (e: any) =>
        e.type === "lab_result" &&
        (e.text ?? e.name ?? "").toLowerCase().includes("glucose")
    )
    expect(glucose).toBeDefined()
    const val = glucose.value ?? glucose.result ?? glucose.result_value
    expect(Math.abs(Number(val) - 186)).toBeLessThan(1)
  })
})
