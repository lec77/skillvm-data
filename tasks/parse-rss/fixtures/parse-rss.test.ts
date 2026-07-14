import { expect, test, describe } from "bun:test"
import { existsSync, readFileSync } from "fs"

const data = existsSync("articles.json") ? JSON.parse(readFileSync("articles.json", "utf-8")) : {}

describe("articles.json", () => {
  test("exists", () => {
    expect(existsSync("articles.json")).toBe(true)
  })
})

describe("feed metadata", () => {
  test("feed_title is Tech Daily News", () => {
    expect(data.feed_title).toBe("Tech Daily News")
  })

  test("feed_description is correct", () => {
    expect(data.feed_description).toContain("Latest technology news")
  })

  test("article_count is 6", () => {
    expect(data.article_count).toBe(6)
  })
})

describe("articles extraction", () => {
  test("has 6 articles", () => {
    expect(data.articles).toBeArrayOfSize(6)
  })

  test("first article title contains GPT-5", () => {
    const hasGpt5 = data.articles.some((a: any) => a.title?.includes("GPT-5"))
    expect(hasGpt5).toBe(true)
  })

  test("each article has required fields", () => {
    for (const article of data.articles) {
      expect(article).toHaveProperty("title")
      expect(article).toHaveProperty("link")
      expect(article).toHaveProperty("description")
      expect(article).toHaveProperty("pub_date")
      expect(article).toHaveProperty("category")
    }
  })

  test("dates in ISO format", () => {
    for (const article of data.articles) {
      expect(article.pub_date).toMatch(/^\d{4}-\d{2}-\d{2}/)
    }
  })
})

describe("categories", () => {
  test("has 6 categories", () => {
    expect(data.categories).toBeArrayOfSize(6)
  })

  test("sorted alphabetically", () => {
    const sorted = [...data.categories].sort()
    expect(data.categories).toEqual(sorted)
  })

  test("contains AI category", () => {
    expect(data.categories).toContain("AI")
  })

  test("contains Security category", () => {
    expect(data.categories).toContain("Security")
  })
})

describe("ordering", () => {
  test("latest_article is GPT-5 article", () => {
    expect(data.latest_article).toContain("GPT-5")
  })

  test("oldest_article is Cybersecurity article", () => {
    expect(data.oldest_article).toContain("Cybersecurity")
  })
})
