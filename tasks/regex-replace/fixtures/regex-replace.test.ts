import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const code = existsSync("cleaned-code.ts") ? readFileSync("cleaned-code.ts", "utf-8") : ""

describe("cleaned-code.ts", () => {
  test("exists", () => {
    expect(existsSync("cleaned-code.ts")).toBe(true)
  })
})

describe("debug removal", () => {
  test("no console.log DEBUG lines remain", () => {
    const debugLogs = code.split("\n").filter(l => l.includes("console.log") && l.includes("DEBUG"))
    expect(debugLogs.length).toBe(0)
  })

  test("no DEBUG constant line", () => {
    expect(code).not.toContain("const DEBUG = true")
  })

  test("no TODO comment about debug", () => {
    expect(code).not.toContain("// TODO: remove this debug logging")
  })
})

describe("var replacement", () => {
  test("no var declarations remain", () => {
    // Match 'var ' as a keyword (not inside strings or comments)
    const varLines = code.split("\n").filter(l => /\bvar\s/.test(l) && !l.trim().startsWith("//"))
    expect(varLines.length).toBe(0)
  })

  test("const for result array", () => {
    expect(code).toMatch(/const\s+result\s*=\s*\[\]/)
  })

  test("const for fullName", () => {
    expect(code).toMatch(/const\s+fullName\s*=/)
  })

  test("let for count", () => {
    expect(code).toMatch(/let\s+count\s*=\s*0/)
  })

  test("let for i in loop", () => {
    expect(code).toMatch(/for\s*\(\s*let\s+i\s*=/)
  })

  test("let for valid", () => {
    expect(code).toMatch(/let\s+valid\s*=/)
  })
})

describe("equality fixes", () => {
  test("no loose equality (==) remains", () => {
    // Match == but not === (negative lookbehind/ahead for =)
    const looseEq = code.match(/[^!=]==[^=]/g) || []
    expect(looseEq.length).toBe(0)
  })

  test("uses strict equality (===)", () => {
    expect(code).toContain('=== "active"')
    expect(code).toContain('=== "pending"')
  })

  test("uses strict inequality (!==)", () => {
    expect(code).toContain("!== -1")
  })
})

describe("whitespace fixes", () => {
  test("no double space in string literals", () => {
    // The original has first + "  " + last
    expect(code).not.toMatch(/"  "/)
  })

  test("single space in string concatenation", () => {
    expect(code).toMatch(/" "/)
  })
})
