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

const JOBS_FILE = "jobs.json"
const SCHEDULE_FILE = "schedule.json"

const DOWNTIME = [
  { machine: 0, start: 5, end: 11 },
  { machine: 1, start: 19, end: 26 },
]

// All expected op_ids for 3 jobs x 3 operations each
const ALL_OP_IDS = ["0-0", "0-1", "0-2", "1-0", "1-1", "1-2", "2-0", "2-1", "2-2"]

// Job precedence order: op index i must finish before op index i+1 starts
const JOB_OPS: Record<number, string[]> = {
  0: ["0-0", "0-1", "0-2"],
  1: ["1-0", "1-1", "1-2"],
  2: ["2-0", "2-1", "2-2"],
}

describe("fjsp-schedule output", () => {
  test("output file exists", () => {
    expect(existsSync(SCHEDULE_FILE)).toBe(true)
  })

  test("all 9 operations scheduled", () => {
    const schedule: Schedule = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"))
    expect(Array.isArray(schedule.assignments)).toBe(true)
    expect(schedule.assignments.length).toBe(9)
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
    // Group by machine
    const byMachine: Record<number, Assignment[]> = {}
    for (const a of schedule.assignments) {
      if (!byMachine[a.machine]) byMachine[a.machine] = []
      byMachine[a.machine].push(a)
    }
    for (const [, ops] of Object.entries(byMachine)) {
      const sorted = [...ops].sort((x, y) => x.start - y.start)
      for (let i = 0; i < sorted.length - 1; i++) {
        // op i must finish before op i+1 starts
        expect(sorted[i].end).toBeLessThanOrEqual(sorted[i + 1].start)
      }
    }
  })

  test("no downtime violations on any machine", () => {
    const schedule: Schedule = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"))
    for (const a of schedule.assignments) {
      for (const w of DOWNTIME) {
        if (a.machine === w.machine) {
          // op must not overlap [w.start, w.end)
          const overlaps = a.start < w.end && a.end > w.start
          expect(overlaps).toBe(false)
        }
      }
    }
  })

  test("makespan is reasonable (less than 45)", () => {
    const schedule: Schedule = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"))
    expect(typeof schedule.makespan).toBe("number")
    expect(schedule.makespan).toBeGreaterThan(0)
    expect(schedule.makespan).toBeLessThan(45)
  })

  test("makespan matches max end time in assignments", () => {
    const schedule: Schedule = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"))
    const maxEnd = Math.max(...schedule.assignments.map((a) => a.end))
    expect(Math.abs(schedule.makespan - maxEnd)).toBeLessThanOrEqual(1)
  })
})
