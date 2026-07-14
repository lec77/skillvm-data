import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

interface Assignment {
  op_id: string
  machine: number
  start: number
  end: number
}

interface Schedule {
  assignments: Assignment[]
  makespan: number
}

const SCHEDULE_FILE = "schedule.json"

// All 12 op_ids across 5 jobs
const ALL_OP_IDS = [
  "0-0", "0-1",
  "1-0", "1-1", "1-2",
  "2-0", "2-1",
  "3-0", "3-1", "3-2",
  "4-0", "4-1",
]

// Job precedence chains
const JOB_OPS: Record<number, string[]> = {
  0: ["0-0", "0-1"],
  1: ["1-0", "1-1", "1-2"],
  2: ["2-0", "2-1"],
  3: ["3-0", "3-1", "3-2"],
  4: ["4-0", "4-1"],
}

describe("job-makespan output", () => {
  test("output file exists", () => {
    expect(existsSync(SCHEDULE_FILE)).toBe(true)
  })

  test("all 12 operations scheduled", () => {
    const schedule: Schedule = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"))
    expect(Array.isArray(schedule.assignments)).toBe(true)
    expect(schedule.assignments.length).toBe(12)
    const scheduledIds = schedule.assignments.map((a) => a.op_id).sort()
    expect(scheduledIds).toEqual([...ALL_OP_IDS].sort())
  })

  test("precedence constraints satisfied for all jobs", () => {
    const schedule: Schedule = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"))
    const byOpId: Record<string, Assignment> = {}
    for (const a of schedule.assignments) {
      byOpId[a.op_id] = a
    }
    for (const [, ops] of Object.entries(JOB_OPS)) {
      for (let i = 0; i < ops.length - 1; i++) {
        const prev = byOpId[ops[i]]
        const next = byOpId[ops[i + 1]]
        expect(prev).toBeDefined()
        expect(next).toBeDefined()
        expect(prev.end).toBeLessThanOrEqual(next.start)
      }
    }
  })

  test("no machine conflicts (no overlapping ops on same machine)", () => {
    const schedule: Schedule = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"))
    const byMachine: Record<number, Assignment[]> = {}
    for (const a of schedule.assignments) {
      if (!byMachine[a.machine]) byMachine[a.machine] = []
      byMachine[a.machine].push(a)
    }
    for (const [, ops] of Object.entries(byMachine)) {
      const sorted = [...ops].sort((x, y) => x.start - y.start)
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].end).toBeLessThanOrEqual(sorted[i + 1].start)
      }
    }
  })

  test("makespan equals max end time in assignments", () => {
    const schedule: Schedule = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"))
    expect(typeof schedule.makespan).toBe("number")
    const maxEnd = Math.max(...schedule.assignments.map((a) => a.end))
    expect(Math.abs(schedule.makespan - maxEnd)).toBeLessThanOrEqual(1)
  })

  test("makespan is competitive (less than 25)", () => {
    const schedule: Schedule = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"))
    expect(schedule.makespan).toBeGreaterThan(0)
    expect(schedule.makespan).toBeLessThan(25)
  })
})
