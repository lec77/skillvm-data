import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

function loadReconciliation(): any {
  return JSON.parse(readFileSync("reconciliation.json", "utf-8"))
}

function getMedName(med: any): string {
  return (med.name ?? med.drug_name ?? med.medication ?? med.drug ?? "").toLowerCase()
}

function getMedDose(med: any): number {
  return Number(med.dose ?? med.dosage ?? med.amount ?? 0)
}

function findMedByName(list: any[], name: string): any | undefined {
  return list.find((m: any) => getMedName(m).includes(name.toLowerCase()))
}

describe("reconciliation.json exists", () => {
  test("reconciliation.json file is present", () => {
    expect(existsSync("reconciliation.json")).toBe(true)
  })

  test("reconciliation.json has required top-level keys", () => {
    const rec = loadReconciliation()
    expect(rec).toBeDefined()
    const hasAdmission =
      "admission_meds" in rec || "admission" in rec || "admissionMeds" in rec
    expect(hasAdmission).toBe(true)
    const hasDischarge =
      "discharge_meds" in rec || "discharge" in rec || "dischargeMeds" in rec
    expect(hasDischarge).toBe(true)
    const hasChanges = "changes" in rec || "reconciliation" in rec
    expect(hasChanges).toBe(true)
  })
})

describe("admission list has 5", () => {
  test("admission list has exactly 5 medications", () => {
    const rec = loadReconciliation()
    const admissionList: any[] =
      rec.admission_meds ?? rec.admission ?? rec.admissionMeds ?? []
    expect(admissionList.length).toBe(5)
  })
})

describe("discharge list has 6", () => {
  test("discharge list has exactly 6 medications", () => {
    const rec = loadReconciliation()
    const dischargeList: any[] =
      rec.discharge_meds ?? rec.discharge ?? rec.dischargeMeds ?? []
    expect(dischargeList.length).toBe(6)
  })
})

describe("Aspirin.*continued|continued.*Aspirin", () => {
  test("Aspirin is in the continued category", () => {
    const rec = loadReconciliation()
    const changes = rec.changes ?? rec.reconciliation ?? {}
    const continued: any[] = changes.continued ?? changes.unchanged ?? []
    const aspirin = continued.find((m: any) => {
      const name = getMedName(m)
      const text = (m.text ?? m.description ?? "").toLowerCase()
      return name.includes("aspirin") || text.includes("aspirin")
    })
    expect(aspirin).toBeDefined()
  })

  test("Aspirin dose is 81mg in both admission and discharge", () => {
    const rec = loadReconciliation()
    const admissionList: any[] =
      rec.admission_meds ?? rec.admission ?? rec.admissionMeds ?? []
    const dischargeList: any[] =
      rec.discharge_meds ?? rec.discharge ?? rec.dischargeMeds ?? []
    const admAspirin = findMedByName(admissionList, "aspirin")
    const disMedAspirin = findMedByName(dischargeList, "aspirin")
    expect(admAspirin).toBeDefined()
    expect(disMedAspirin).toBeDefined()
    expect(getMedDose(admAspirin)).toBe(81)
    expect(getMedDose(disMedAspirin)).toBe(81)
  })
})

describe("Metformin.*increased|increased.*Metformin|Omeprazole.*discontinued|discontinued.*Omeprazole", () => {
  test("Metformin is in the increased/changed category", () => {
    const rec = loadReconciliation()
    const changes = rec.changes ?? rec.reconciliation ?? {}
    const increased: any[] =
      changes.increased ?? changes.changed ?? changes.dose_changes ?? []
    const metformin = increased.find((m: any) => {
      const name = getMedName(m)
      const text = (m.text ?? m.description ?? "").toLowerCase()
      // May be an object with from/to or just the drug entry
      const from = getMedName(m.from ?? {})
      const to = getMedName(m.to ?? {})
      return (
        name.includes("metformin") ||
        text.includes("metformin") ||
        from.includes("metformin") ||
        to.includes("metformin")
      )
    })
    expect(metformin).toBeDefined()
  })

  test("Lisinopril is also in the increased/changed category", () => {
    const rec = loadReconciliation()
    const changes = rec.changes ?? rec.reconciliation ?? {}
    const increased: any[] =
      changes.increased ?? changes.changed ?? changes.dose_changes ?? []
    const lisinopril = increased.find((m: any) => {
      const name = getMedName(m)
      const text = (m.text ?? m.description ?? "").toLowerCase()
      const from = getMedName(m.from ?? {})
      const to = getMedName(m.to ?? {})
      return (
        name.includes("lisinopril") ||
        text.includes("lisinopril") ||
        from.includes("lisinopril") ||
        to.includes("lisinopril")
      )
    })
    expect(lisinopril).toBeDefined()
  })

  test("Omeprazole is in the discontinued category", () => {
    const rec = loadReconciliation()
    const changes = rec.changes ?? rec.reconciliation ?? {}
    const discontinued: any[] = changes.discontinued ?? changes.stopped ?? []
    const omeprazole = discontinued.find((m: any) => {
      const name = getMedName(m)
      const text = (m.text ?? m.description ?? "").toLowerCase()
      return name.includes("omeprazole") || text.includes("omeprazole")
    })
    expect(omeprazole).toBeDefined()
  })

  test("Glipizide is in the new medications category", () => {
    const rec = loadReconciliation()
    const changes = rec.changes ?? rec.reconciliation ?? {}
    const newMeds: any[] =
      changes.new_meds ?? changes.new ?? changes.added ?? changes.started ?? []
    const glipizide = newMeds.find((m: any) => {
      const name = getMedName(m)
      const text = (m.text ?? m.description ?? "").toLowerCase()
      return name.includes("glipizide") || text.includes("glipizide")
    })
    expect(glipizide).toBeDefined()
  })

  test("Furosemide is in the new medications category", () => {
    const rec = loadReconciliation()
    const changes = rec.changes ?? rec.reconciliation ?? {}
    const newMeds: any[] =
      changes.new_meds ?? changes.new ?? changes.added ?? changes.started ?? []
    const furosemide = newMeds.find((m: any) => {
      const name = getMedName(m)
      const text = (m.text ?? m.description ?? "").toLowerCase()
      return name.includes("furosemide") || text.includes("furosemide")
    })
    expect(furosemide).toBeDefined()
  })
})

describe("statin.*switch|switch.*statin|Simvastatin.*Atorvastatin|Atorvastatin.*Simvastatin", () => {
  test("statin class switch from Simvastatin to Atorvastatin is detected", () => {
    const rec = loadReconciliation()
    const changes = rec.changes ?? rec.reconciliation ?? {}
    const switched: any[] =
      changes.switched ?? changes.substituted ?? changes.class_switches ?? []

    if (switched.length > 0) {
      // Check that the switched list mentions both statins or the class
      const switchEntry = switched.find((m: any) => {
        const text = JSON.stringify(m).toLowerCase()
        return (
          (text.includes("simvastatin") || text.includes("atorvastatin")) &&
          (text.includes("statin") ||
            text.includes("simvastatin") ||
            text.includes("atorvastatin"))
        )
      })
      expect(switchEntry).toBeDefined()
    } else {
      // Acceptable alternative: agent categorized the statin switch under discontinued + new
      // In that case Simvastatin should be discontinued and Atorvastatin should be new
      const discontinued: any[] = changes.discontinued ?? changes.stopped ?? []
      const newMeds: any[] =
        changes.new_meds ?? changes.new ?? changes.added ?? changes.started ?? []

      const simDisc = discontinued.find((m: any) =>
        JSON.stringify(m).toLowerCase().includes("simvastatin")
      )
      const atorNew = newMeds.find((m: any) =>
        JSON.stringify(m).toLowerCase().includes("atorvastatin")
      )

      // At minimum, both drugs must appear somewhere in the output
      const fullText = JSON.stringify(rec).toLowerCase()
      expect(fullText.includes("simvastatin")).toBe(true)
      expect(fullText.includes("atorvastatin")).toBe(true)

      // And the changes object must reflect that the statin changed
      const hasSwitch =
        (simDisc !== undefined && atorNew !== undefined) ||
        switched.length > 0
      expect(hasSwitch).toBe(true)
    }
  })
})
