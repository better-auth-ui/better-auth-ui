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
    const docsIndex = readDocsFile("index.mdx")
    const rootMeta = JSON.parse(readDocsFile("meta.json")) as {
      pages: string[]
    }

    expect(rootMeta.pages).toContain("solid")
    expect(rootMeta.pages).toContain("zaidan")
    expect(docsIndex).toContain("/docs/zaidan")
    expect(docsIndex).toContain("Zaidan Solid")
    expect(docsIndex).toContain("Copied Solid components for TanStack Start")

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
      pages: ["index", "queries", "mutations", "ssr"]
    })

    const solidQueriesMeta = JSON.parse(
      readDocsFile("solid", "queries", "meta.json")
    ) as { pages: string[]; title: string }
    const solidMutationsMeta = JSON.parse(
      readDocsFile("solid", "mutations", "meta.json")
    ) as { pages: string[]; title: string }

    expect(solidQueriesMeta).toMatchObject({
      title: "Queries",
      pages: [
        "index",
        "---Auth---",
        "session",
        "user",
        "authenticate",
        "---Settings---",
        "list-accounts",
        "account-info",
        "list-sessions",
        "list-device-sessions",
        "list-passkeys",
        "list-api-keys"
      ]
    })
    expect(solidMutationsMeta).toMatchObject({
      title: "Mutations",
      pages: [
        "index",
        "---Auth---",
        "sign-in-email",
        "sign-in-username",
        "sign-in-magic-link",
        "sign-in-passkey",
        "sign-in-social",
        "sign-up-email",
        "sign-out",
        "request-password-reset",
        "reset-password",
        "send-verification-email",
        "is-username-available",
        "---Settings---",
        "update-user",
        "change-email",
        "change-password",
        "delete-user",
        "link-social",
        "unlink-account",
        "add-passkey",
        "delete-passkey",
        "revoke-session",
        "revoke-multi-session",
        "set-active-session",
        "create-api-key",
        "delete-api-key"
      ]
    })
  })

  it("documents only the Solid runtime/package track", () => {
    const requiredPages = [
      "index.mdx",
      "queries/index.mdx",
      "queries/session.mdx",
      "queries/user.mdx",
      "queries/authenticate.mdx",
      "queries/list-accounts.mdx",
      "queries/account-info.mdx",
      "queries/list-sessions.mdx",
      "queries/list-device-sessions.mdx",
      "queries/list-passkeys.mdx",
      "queries/list-api-keys.mdx",
      "mutations/index.mdx",
      "mutations/sign-in-email.mdx",
      "mutations/sign-in-username.mdx",
      "mutations/sign-in-magic-link.mdx",
      "mutations/sign-in-passkey.mdx",
      "mutations/sign-in-social.mdx",
      "mutations/sign-up-email.mdx",
      "mutations/sign-out.mdx",
      "mutations/request-password-reset.mdx",
      "mutations/reset-password.mdx",
      "mutations/send-verification-email.mdx",
      "mutations/is-username-available.mdx",
      "mutations/update-user.mdx",
      "mutations/change-email.mdx",
      "mutations/change-password.mdx",
      "mutations/delete-user.mdx",
      "mutations/link-social.mdx",
      "mutations/unlink-account.mdx",
      "mutations/add-passkey.mdx",
      "mutations/delete-passkey.mdx",
      "mutations/revoke-session.mdx",
      "mutations/revoke-multi-session.mdx",
      "mutations/set-active-session.mdx",
      "mutations/create-api-key.mdx",
      "mutations/delete-api-key.mdx",
      "ssr.mdx"
    ]
    const removedPages = [
      "integrations.mdx",
      "plugins.mdx",
      "registry.mdx",
      "server.mdx",
      "gaps.mdx",
      "queries.mdx",
      "mutations.mdx"
    ]

    for (const page of requiredPages) {
      expect(existsSync(join(docsRoot, "solid", page))).toBe(true)
    }

    for (const page of removedPages) {
      expect(existsSync(join(docsRoot, "solid", page))).toBe(false)
    }

    const index = readDocsFile("solid", "index.mdx")
    const ssr = readDocsFile("solid", "ssr.mdx")

    expect(index).toContain("@better-auth-ui/solid")
    expect(index).toContain("/docs/zaidan/integrations/tanstack-start")
    expect(index).not.toContain("/docs/solid/integrations")
    expect(index).not.toContain("Solid Start")
    expect(ssr).toContain("@better-auth-ui/solid/server")
    expect(ssr).toContain("does not create routes")
  })

  it("surfaces explicit non-goals without coupling Solid docs to React runtime execution", () => {
    const index = readDocsFile("solid", "index.mdx")
    const mutations = readDocsFile("solid", "mutations", "index.mdx")
    const source = readFileSync(sourceFile, "utf8")

    expect(index).toContain("React email templates")
    expect(index).toContain("HeroUI React components")
    expect(mutations).toContain("The Solid package does not render toast UI")
    expect(mutations).toContain("installed Zaidan components")
    expect(source).toContain("Solid")
    expect(source).not.toContain("/r/solid")
  })
})
