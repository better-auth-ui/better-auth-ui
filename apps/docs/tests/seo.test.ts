import { describe, expect, test } from "vitest"
import {
  createSitemap,
  pageHead,
  siteDescription,
  socialImage
} from "../src/lib/seo"

describe("search and social metadata", () => {
  test("gives the homepage an explicit canonical URL and preview", () => {
    const head = pageHead("/", "Better Auth UI", siteDescription)
    expect(head.links).toEqual([
      { rel: "canonical", href: "https://better-auth-ui.com/" }
    ])
    expect(head.meta).toContainEqual({
      property: "og:title",
      content: "Better Auth UI"
    })
    expect(head.meta).toContainEqual({
      property: "og:description",
      content: siteDescription
    })
    expect(head.meta).toContainEqual({
      property: "og:image",
      content: socialImage
    })
    expect(head.meta).toContainEqual({
      name: "twitter:image",
      content: socialImage
    })
  })
  test("keeps the documentation canonical and page description", () => {
    const head = pageHead(
      "/docs/react/shadcn",
      "React · Better Auth UI",
      "React authentication components",
      "article"
    )
    expect(head.links[0]?.href).toBe(
      "https://better-auth-ui.com/docs/react/shadcn"
    )
    expect(head.meta).toContainEqual({
      property: "og:type",
      content: "article"
    })
    expect(head.meta).toContainEqual({
      name: "description",
      content: "React authentication components"
    })
  })
  test("builds sitemap locations without duplicate pages or unescaped queries", () => {
    const xml = createSitemap([
      "/docs",
      "/docs/react",
      "/docs",
      "/docs/search?a=1&b=2"
    ])
    expect(
      xml.match(/<loc>https:\/\/better-auth-ui.com\/docs<\/loc>/gu)
    ).toHaveLength(1)
    expect(xml).toContain("<loc>https://better-auth-ui.com/</loc>")
    expect(xml).toContain("/docs/search?a=1&amp;b=2</loc>")
    expect(xml).not.toContain("<lastmod>")
  })
})
