import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const docsRoot = join(import.meta.dirname, "../content/docs")
const sourceFile = join(import.meta.dirname, "../src/lib/source.tsx")

function readDocsFile(...segments: string[]) {
  return readFileSync(join(docsRoot, ...segments), "utf8")
}

describe("Solid docs navigation", () => {
  it("adds Solid as a root docs section with the expected page order", () => {
    const rootMeta = JSON.parse(readDocsFile("meta.json")) as {
      pages: string[]
    }

    expect(rootMeta.pages).toContain("solid")

    const solidMeta = JSON.parse(readDocsFile("solid", "meta.json")) as {
      title: string
      icon: string
      root: boolean
      pages: string[]
    }

    expect(solidMeta).toMatchObject({
      title: "Solid",
      icon: "Solid",
      root: true,
      pages: [
        "index",
        "integrations",
        "plugins",
        "registry",
        "queries",
        "mutations",
        "gaps"
      ]
    })
  })

  it("documents the Solid package, Solid Start example, and Zaidan registry namespace", () => {
    const requiredPages = [
      "index.mdx",
      "integrations.mdx",
      "plugins.mdx",
      "registry.mdx",
      "queries.mdx",
      "mutations.mdx",
      "gaps.mdx"
    ]

    for (const page of requiredPages) {
      expect(existsSync(join(docsRoot, "solid", page))).toBe(true)
    }

    const index = readDocsFile("solid", "index.mdx")
    const integrations = readDocsFile("solid", "integrations.mdx")
    const registry = readDocsFile("solid", "registry.mdx")

    expect(index).toContain("@better-auth-ui/solid")
    expect(integrations).toContain("examples/start-solid-zaidan-example")
    expect(registry).toContain(
      "https://better-auth-ui.com/r/solid/registry.json"
    )
    expect(registry).toContain(
      "https://better-auth-ui.com/r/solid/forgot-password.json"
    )
    expect(registry).toContain(
      "https://better-auth-ui.com/r/solid/reset-password.json"
    )
    expect(registry).toContain(
      "https://better-auth-ui.com/r/solid/sign-up.json"
    )
    expect(registry).toContain("apps/docs/public/r/solid")
  })

  it("surfaces explicit non-goals without coupling Solid docs to React runtime execution", () => {
    const gaps = readDocsFile("solid", "gaps.mdx")
    const mutations = readDocsFile("solid", "mutations.mdx")
    const source = readFileSync(sourceFile, "utf8")

    expect(gaps).toContain("react-email")
    expect(gaps).toContain("@react-email/components")
    expect(gaps).toContain("solid-js/web")
    expect(gaps).toContain("renderToString")
    expect(gaps).toContain("@monkedevlife/solidjs-email-render")
    expect(gaps).toContain("deprecated")
    expect(gaps).toContain("app-owned")
    expect(gaps).toContain("sonner")
    expect(gaps).toContain("solid-sonner")
    expect(mutations).toContain("Zaidan Sonner")
    expect(mutations).toContain("@better-auth-ui/solid` does not re-export")
    expect(gaps).toContain("HeroUI")
    expect(source).toContain("Solid")
    expect(source).not.toContain("/r/solid")
  })
})
