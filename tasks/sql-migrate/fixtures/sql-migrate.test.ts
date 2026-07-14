import { expect, test, describe } from "bun:test"
import { Database } from "bun:sqlite"
import { existsSync, readFileSync } from "fs"

describe("database", () => {
  test("company.db exists", () => {
    expect(existsSync("company.db")).toBe(true)
  })

  test("departments table has correct structure", () => {
    const db = new Database("company.db", { readonly: true })
    const cols = db.prepare("PRAGMA table_info(departments)").all() as any[]
    const names = cols.map((c: any) => c.name)
    expect(names).toContain("id")
    expect(names).toContain("name")
    expect(names).toContain("budget")
    db.close()
  })

  test("employees table has correct structure", () => {
    const db = new Database("company.db", { readonly: true })
    const cols = db.prepare("PRAGMA table_info(employees)").all() as any[]
    const names = cols.map((c: any) => c.name)
    expect(names).toContain("id")
    expect(names).toContain("name")
    expect(names).toContain("department_id")
    db.close()
  })

  test("projects table has correct structure", () => {
    const db = new Database("company.db", { readonly: true })
    const cols = db.prepare("PRAGMA table_info(projects)").all() as any[]
    const names = cols.map((c: any) => c.name)
    expect(names).toContain("id")
    expect(names).toContain("name")
    expect(names).toContain("deadline")
    db.close()
  })

  test("assignments table has correct structure", () => {
    const db = new Database("company.db", { readonly: true })
    const cols = db.prepare("PRAGMA table_info(assignments)").all() as any[]
    const names = cols.map((c: any) => c.name)
    expect(names).toContain("employee_id")
    expect(names).toContain("project_id")
    expect(names).toContain("hours_worked")
    db.close()
  })

  test("foreign key constraints exist on employees", () => {
    const db = new Database("company.db", { readonly: true })
    const fks = db.prepare("PRAGMA foreign_key_list(employees)").all() as any[]
    const tables = fks.map((f: any) => f.table)
    expect(tables).toContain("departments")
    db.close()
  })
})

describe("data integrity", () => {
  test("departments row count is 3", () => {
    const db = new Database("company.db", { readonly: true })
    const r = db.prepare("SELECT COUNT(*) as cnt FROM departments").get() as any
    expect(r.cnt).toBe(3)
    db.close()
  })

  test("employees row count is 8", () => {
    const db = new Database("company.db", { readonly: true })
    const r = db.prepare("SELECT COUNT(*) as cnt FROM employees").get() as any
    expect(r.cnt).toBe(8)
    db.close()
  })

  test("department count matches 3 unique departments", () => {
    const db = new Database("company.db", { readonly: true })
    const depts = db.prepare("SELECT name FROM departments ORDER BY name").all() as any[]
    expect(depts.map((d: any) => d.name)).toEqual(["Engineering", "Marketing", "Sales"])
    db.close()
  })

  test("no duplicate assignments", () => {
    const db = new Database("company.db", { readonly: true })
    const r = db.prepare("SELECT COUNT(*) as cnt FROM assignments").get() as any
    expect(r.cnt).toBe(16)
    db.close()
  })
})

describe("migration_report.json", () => {
  test("report file exists", () => {
    expect(existsSync("migration_report.json")).toBe(true)
  })

  test("total_employees is 8", () => {
    const r = JSON.parse(readFileSync("migration_report.json", "utf-8"))
    expect(r.total_employees).toBe(8)
  })

  test("total_projects is 4", () => {
    const r = JSON.parse(readFileSync("migration_report.json", "utf-8"))
    expect(r.total_projects).toBe(4)
  })

  test("dept_headcount is correct", () => {
    const r = JSON.parse(readFileSync("migration_report.json", "utf-8"))
    const hc = r.dept_headcount
    expect(hc["Engineering"] || hc["engineering"]).toBe(4)
    expect(hc["Marketing"] || hc["marketing"]).toBe(2)
    expect(hc["Sales"] || hc["sales"]).toBe(2)
  })

  test("project_hours sorted correctly", () => {
    const r = JSON.parse(readFileSync("migration_report.json", "utf-8"))
    const ph = r.project_hours
    expect(ph.length).toBe(4)
    // Alpha: 120+40+200+95+45=500, Beta: 80+90+150=320, Gamma: 160+60+70+55=345, Delta: 110+140+30+180=460
    expect(ph[0].project_name || ph[0].name).toBe("Alpha")
    expect(ph[0].total_hours || ph[0].hours).toBe(500)
    expect(ph[1].project_name || ph[1].name).toBe("Delta")
    expect(ph[1].total_hours || ph[1].hours).toBe(460)
  })

  test("top_contributor is Carol White", () => {
    const r = JSON.parse(readFileSync("migration_report.json", "utf-8"))
    // Carol: 200+60=260
    expect(r.top_contributor).toBe("Carol White")
  })

  test("engineering_projects is correct", () => {
    const r = JSON.parse(readFileSync("migration_report.json", "utf-8"))
    const ep = r.engineering_projects
    // Engineering employees: Alice, Carol, Frank, Helen → projects: Alpha, Beta, Gamma, Delta
    expect(ep).toEqual(["Alpha", "Beta", "Delta", "Gamma"])
  })
})
