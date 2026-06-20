import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { basePaths, providerNames, viewPaths } from "@better-auth-ui/core"
import { socialProviderList } from "better-auth/social-providers"
import { describe, expect, it, vi } from "vitest"
import {
  authMutationOptions,
  authQueryOptions,
  createAuthClient,
  providerIconNames,
  resolveAuthConfig
} from "../src"

const packageJson = () =>
  JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf8")) as {
    name: string
    version: string
    exports: Record<string, unknown>
    peerDependencies: Record<string, string>
  }

describe("@better-auth-ui/solid foundation", () => {
  it("declares the additive Solid package exports with native email support", () => {
    const metadata = packageJson()

    expect(metadata.name).toBe("@better-auth-ui/solid")
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+/)
    expect(Object.keys(metadata.exports).sort()).toEqual([
      ".",
      "./email",
      "./plugins"
    ])
    expect(metadata.exports).toHaveProperty("./email")
  })

  it("declares Solid runtime peers needed by the public surface", () => {
    const peers = packageJson().peerDependencies

    expect(Object.keys(peers)).toEqual(
      expect.arrayContaining([
        "@better-auth-ui/core",
        "@solidjs-email/main",
        "@tanstack/solid-query",
        "better-auth",
        "solid-js"
      ])
    )
  })

  it("exposes the Solid Better Auth client factory", () => {
    expect(typeof createAuthClient).toBe("function")
  })

  it("resolves auth config with React-equivalent defaults", () => {
    const navigate = vi.fn()
    const authClient = createAuthClient({ baseURL: "http://localhost:3000" })
    const config = resolveAuthConfig({ authClient, navigate })

    expect(config.basePaths).toEqual(basePaths)
    expect(config.viewPaths).toEqual(viewPaths)
    expect(config.redirectTo).toBe("/")
    expect(config.baseURL).toBe("")
    expect(config.navigate).toBe(navigate)
  })

  it("merges nested auth config and plugin additional fields deterministically", () => {
    const authClient = createAuthClient({ baseURL: "http://localhost:3000" })
    const config = resolveAuthConfig({
      authClient,
      emailAndPassword: { rememberMe: true },
      plugins: [
        {
          id: "profile",
          additionalFields: [
            { name: "displayName", type: "string", label: "Display name" }
          ]
        }
      ],
      additionalFields: [
        { name: "displayName", type: "string", label: "Preferred name" }
      ]
    })

    expect(config.emailAndPassword.rememberMe).toBe(true)
    expect(config.emailAndPassword.enabled).toBe(true)
    expect(config.additionalFields).toEqual([
      { name: "displayName", type: "string", label: "Preferred name" }
    ])
  })

  it("builds Solid query options with shared key semantics and throwing fetch options", async () => {
    const authFn = vi.fn(async ({ query, fetchOptions }) => ({
      data: { query, fetchOptions }
    }))
    const options = authQueryOptions(authFn, ["auth", "getSession"] as const, {
      query: { fresh: true },
      fetchOptions: { credentials: "include" }
    })
    const signal = new AbortController().signal

    expect(options.queryKey).toEqual(["auth", "getSession", { fresh: true }])
    await expect(
      (
        options as { queryFn?: (context: { signal: AbortSignal }) => unknown }
      ).queryFn?.({ signal })
    ).resolves.toEqual({
      data: {
        query: { fresh: true },
        fetchOptions: { credentials: "include", signal, throw: true }
      }
    })
  })

  it("builds Solid mutation options that preserve mutation keys and throw on fetch errors", async () => {
    const authFn = vi.fn(async (variables) => ({ data: variables.email }))
    const options = authMutationOptions(authFn, ["auth", "signIn", "email"])

    expect(options.mutationKey).toEqual(["auth", "signIn", "email"])
    await expect(
      (
        options as {
          mutationFn?: (variables: {
            email: string
            fetchOptions: { credentials: string }
          }) => unknown
        }
      ).mutationFn?.({
        email: "ada@example.com",
        fetchOptions: { credentials: "include" }
      })
    ).resolves.toEqual({ data: "ada@example.com" })
    expect(authFn).toHaveBeenCalledWith({
      email: "ada@example.com",
      fetchOptions: { credentials: "include", throw: true }
    })
  })

  it("tracks every core social provider as a Solid icon registry placeholder", () => {
    expect(providerIconNames).toEqual(Object.keys(providerNames).sort())
    expect(providerIconNames).toHaveLength(socialProviderList.length)
  })
})
