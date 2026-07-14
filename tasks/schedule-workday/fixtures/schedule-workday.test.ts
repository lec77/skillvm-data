import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const data = existsSync("daily_plan.json") ? JSON.parse(readFileSync("daily_plan.json", "utf-8")) : {}

describe("daily_plan.json", () => {
  test("exists", () => {
    expect(existsSync("daily_plan.json")).toBe(true)
  })
})

describe("date field", () => {
  test("date is 2026-03-20", () => {
    expect(data.date).toBe("2026-03-20")
  })
})

describe("top_3_priorities", () => {
  const priority1Tasks = ["Write quarterly report", "Review pull requests", "Update project roadmap"]

  test("top_3_priorities has exactly 3 items", () => {
    expect(data.top_3_priorities).toBeArrayOfSize(3)
  })

  test("top_3_priorities contains Write quarterly report", () => {
    expect(data.top_3_priorities).toContain("Write quarterly report")
  })

  test("top_3_priorities contains Review pull requests", () => {
    expect(data.top_3_priorities).toContain("Review pull requests")
  })

  test("top_3_priorities contains Update project roadmap", () => {
    expect(data.top_3_priorities).toContain("Update project roadmap")
  })
})

describe("time blocks", () => {
  test("time_blocks is a non-empty array", () => {
    expect(data.time_blocks).toBeArray()
    expect(data.time_blocks.length).toBeGreaterThan(0)
  })

  test("each block has required fields", () => {
    for (const block of data.time_blocks) {
      expect(block).toHaveProperty("start_time")
      expect(block).toHaveProperty("end_time")
      expect(block).toHaveProperty("name")
      expect(block).toHaveProperty("tasks")
    }
  })

  test("no overlap between time blocks", () => {
    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number)
      return h * 60 + m
    }
    const sorted = [...data.time_blocks].sort((a: any, b: any) => toMin(a.start_time) - toMin(b.start_time))
    for (let i = 1; i < sorted.length; i++) {
      expect(toMin(sorted[i].start_time)).toBeGreaterThanOrEqual(toMin(sorted[i - 1].end_time))
    }
  })

  test("fixed commitments appear as blocks", () => {
    const names = data.time_blocks.map((b: any) => b.name.toLowerCase())
    const allText = names.join(" ")
    expect(allText).toContain("standup")
    expect(allText).toContain("design review")
    expect(allText).toContain("1:1")
  })

  test("all 8 tasks appear somewhere in time blocks", () => {
    const allTasks = data.time_blocks.flatMap((b: any) => b.tasks || [])
    const taskNames = [
      "Write quarterly report", "Review pull requests", "Update project roadmap",
      "Respond to client emails", "Prepare presentation slides",
      "Organize desktop files", "Read industry newsletter", "Update team wiki"
    ]
    for (const name of taskNames) {
      const found = allTasks.some((t: string) => t.includes(name) || name.includes(t))
      expect(found).toBe(true)
    }
  })
})

describe("buffer", () => {
  test("buffer_percentage is at least 15", () => {
    expect(data.buffer_percentage).toBeGreaterThanOrEqual(15)
  })

  test("total_scheduled_minutes is a positive number", () => {
    expect(data.total_scheduled_minutes).toBeGreaterThan(0)
  })
})
