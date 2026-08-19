import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  getSsoFallbackEmail,
  setSsoFallbackEmail,
  signInSsoOptions,
  ssoLocalization,
  ssoMutationKeys,
  ssoPlugin
} from "../src/plugins/sso"

describe("ssoPlugin", () => {
  const storage = new Map<string, string>()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value)
    })
  })

  it("enables email-first discovery and merges localization", () => {
    expect(ssoPlugin.id).toBe("sso")
    expect(ssoPlugin()).toMatchObject({
      id: "sso",
      emailFirst: true,
      localization: ssoLocalization
    })
    expect(
      ssoPlugin({
        emailFirst: false,
        localization: { continueWithEmail: "Find my workspace" }
      })
    ).toMatchObject({
      emailFirst: false,
      localization: {
        continueWithEmail: "Find my workspace",
        noProvider: ssoLocalization.noProvider
      }
    })
  })

  it("calls Better Auth SSO with throw-enabled fetch options", async () => {
    const sso = vi.fn(async () => ({ data: { url: "/sso" }, error: null }))
    const mutation = signInSsoOptions({ signIn: { sso } } as never)
    const variables = {
      email: "person@example.com",
      callbackURL: "https://app.example.com/settings",
      fetchOptions: { headers: { "x-request-id": "request-1" } }
    }

    await mutation.mutationFn?.(variables as never)

    expect(sso).toHaveBeenCalledWith({
      ...variables,
      fetchOptions: {
        ...variables.fetchOptions,
        throw: true
      }
    })
    expect(mutation.mutationKey).toEqual(ssoMutationKeys.signIn)
  })

  it("carries the discovered email into fallback views", () => {
    setSsoFallbackEmail("person@example.com")
    expect(getSsoFallbackEmail()).toBe("person@example.com")
  })

  it("continues when session storage is unavailable", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new DOMException("Storage access denied")
      },
      setItem: () => {
        throw new DOMException("Storage access denied")
      }
    })

    expect(() => setSsoFallbackEmail("person@example.com")).not.toThrow()
    expect(getSsoFallbackEmail()).toBe("")
  })

  it("continues when reading the storage global throws", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "sessionStorage"
    )

    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      get() {
        throw new DOMException("Storage access denied")
      }
    })

    try {
      expect(() => setSsoFallbackEmail("person@example.com")).not.toThrow()
      expect(getSsoFallbackEmail()).toBe("")
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, "sessionStorage", descriptor)
      } else {
        Reflect.deleteProperty(globalThis, "sessionStorage")
      }
    }
  })
})
