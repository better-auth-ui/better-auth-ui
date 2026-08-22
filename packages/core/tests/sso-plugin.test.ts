import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  deleteSsoProviderOptions,
  getSsoFallbackEmail,
  registerSsoProviderOptions,
  requestSsoDomainVerificationOptions,
  setSsoFallbackEmail,
  signInSsoOptions,
  ssoLocalization,
  ssoMutationKeys,
  ssoPlugin,
  ssoProvidersOptions,
  ssoQueryKeys,
  updateSsoProviderOptions,
  verifySsoDomainOptions
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
      localization: ssoLocalization,
      organization: true,
      path: "sso"
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

  it("registers providers with throw-enabled fetch options", async () => {
    const register = vi.fn(async () => ({ data: {}, error: null }))
    const mutation = registerSsoProviderOptions({ sso: { register } } as never)
    const variables = {
      providerId: "acme",
      issuer: "https://idp.example.com",
      domain: "example.com",
      oidcConfig: { clientId: "client-id", clientSecret: "secret" },
      fetchOptions: { headers: { "x-request-id": "request-1" } }
    }

    await mutation.mutationFn?.(variables as never)

    expect(register).toHaveBeenCalledWith({
      ...variables,
      fetchOptions: {
        ...variables.fetchOptions,
        throw: true
      }
    })
    expect(mutation.mutationKey).toEqual(ssoMutationKeys.register)
  })

  it("lists providers only after a session is available", async () => {
    const providers = vi.fn(async () => ({
      data: { providers: [] },
      error: null
    }))
    const authClient = { sso: { providers } } as never

    expect(ssoProvidersOptions(authClient).queryFn).toBeTypeOf("symbol")

    const options = ssoProvidersOptions(authClient, "user-1")
    const signal = new AbortController().signal
    const data = await (
      options.queryFn as (context: {
        signal: AbortSignal
      }) => Promise<{ providers: unknown[] }>
    )({ signal })

    expect(data).toEqual({ providers: [] })
    expect(providers).toHaveBeenCalledWith({ fetchOptions: { signal } })
  })

  it("updates and deletes providers with scoped cache invalidation", async () => {
    const updateProvider = vi.fn(async () => ({ data: {}, error: null }))
    const deleteProvider = vi.fn(async () => ({ data: {}, error: null }))
    const authClient = { sso: { deleteProvider, updateProvider } } as never
    const update = updateSsoProviderOptions(authClient, "user-1")
    const remove = deleteSsoProviderOptions(authClient, "user-1")

    await update.mutationFn?.({
      providerId: "acme",
      domain: "example.com"
    } as never)
    await remove.mutationFn?.({ providerId: "acme" } as never)

    expect(updateProvider).toHaveBeenCalledWith({
      providerId: "acme",
      domain: "example.com",
      fetchOptions: { throw: true }
    })
    expect(deleteProvider).toHaveBeenCalledWith({
      providerId: "acme",
      fetchOptions: { throw: true }
    })
    expect(update.meta).toEqual({
      awaits: [ssoQueryKeys.providers.all("user-1")]
    })
    expect(remove.meta).toEqual(update.meta)
  })

  it("manages domain verification with distinct mutations", async () => {
    const requestDomainVerification = vi.fn(async () => ({
      data: { domainVerificationToken: "token" },
      error: null
    }))
    const verifyDomain = vi.fn(async () => ({ data: undefined, error: null }))
    const authClient = {
      sso: { requestDomainVerification, verifyDomain }
    } as never
    const request = requestSsoDomainVerificationOptions(authClient)
    const verify = verifySsoDomainOptions(authClient)
    const variables = {
      providerId: "acme",
      fetchOptions: { headers: { "x-request-id": "request-1" } }
    }

    await request.mutationFn?.(variables as never)
    await verify.mutationFn?.(variables as never)

    expect(requestDomainVerification).toHaveBeenCalledWith({
      ...variables,
      fetchOptions: {
        ...variables.fetchOptions,
        throw: true
      }
    })
    expect(verifyDomain).toHaveBeenCalledWith({
      ...variables,
      fetchOptions: {
        ...variables.fetchOptions,
        throw: true
      }
    })
    expect(request.mutationKey).toEqual(
      ssoMutationKeys.requestDomainVerification
    )
    expect(verify.mutationKey).toEqual(ssoMutationKeys.verifyDomain)
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
