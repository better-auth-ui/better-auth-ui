import { describe, expect, it, vi } from "vitest"
import {
  createBetterAuthOAuthClientManager,
  groupOAuthConsents,
  hasOAuthPrompt,
  type OAuthScopeMetadataDefinition,
  oauthProviderLocalization,
  oauthProviderMutationKeys,
  oauthProviderPlugin,
  oauthProviderQueryKeys,
  oauthProviderScopeMetadata,
  parseOAuthAuthorizationRequest,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl
} from "../src/plugins/oauth-provider"

const context = { clientId: "client-123", requestedScopes: ["openid"] }

describe("oauthProviderPlugin", () => {
  it("adapts Better Auth user client endpoints without accepting organization state", async () => {
    const getClients = vi.fn(async () => [])
    const createClient = vi.fn(async (input) => ({
      ...input,
      client_id: "client-1"
    }))
    const authClient = {
      oauth2: {
        getClients,
        createClient,
        updateClient: vi.fn(),
        deleteClient: vi.fn(),
        client: { rotateSecret: vi.fn() }
      }
    }
    const manager = createBetterAuthOAuthClientManager(authClient as never)

    await manager.list({ type: "user" })
    await manager.create(
      { type: "user" },
      {
        client_name: "Acme CLI",
        redirect_uris: ["https://example.com/callback"]
      }
    )

    expect(getClients).toHaveBeenCalledWith({
      fetchOptions: { signal: undefined, throw: true }
    })
    expect(createClient).toHaveBeenCalledWith({
      client_name: "Acme CLI",
      redirect_uris: ["https://example.com/callback"],
      fetchOptions: { throw: true }
    })
    await expect(
      manager.list({
        type: "organization",
        organizationId: "org-1",
        organizationSlug: "acme"
      })
    ).rejects.toThrow("cannot safely scope organization clients")
  })

  it("registers its own routes without touching the built-in sign-up path", () => {
    const plugin = oauthProviderPlugin()

    expect(oauthProviderPlugin.id).toBe("oauthProvider")
    expect(plugin).toMatchObject({
      id: "oauthProvider",
      localization: oauthProviderLocalization,
      showConnectedApplications: true,
      viewPaths: {
        auth: {
          oauthConsent: "oauth-consent",
          oauthSignUp: "oauth-sign-up",
          oauthSelectAccount: "select-account"
        }
      }
    })
    // Every contributed path is namespaced — the plugin never claims a
    // built-in view key like `signUp`.
    expect(Object.keys(plugin.viewPaths.auth)).toEqual([
      "oauthConsent",
      "oauthSignUp",
      "oauthSelectAccount"
    ])
  })

  it("merges paths, localization, and connected application visibility", () => {
    const plugin = oauthProviderPlugin({
      path: "authorize",
      signUpPath: "register",
      selectAccountPath: "accounts",
      showConnectedApplications: false,
      clientManagement: true,
      clientManagementPath: "developers",
      localization: { allow: "Approve" }
    })

    expect(plugin.viewPaths.auth.oauthConsent).toBe("authorize")
    expect(plugin.viewPaths.auth.oauthSignUp).toBe("register")
    expect(plugin.viewPaths.auth.oauthSelectAccount).toBe("accounts")
    expect(plugin.showConnectedApplications).toBe(false)
    expect(plugin.clientManagement).toBe(true)
    expect(plugin.viewPaths.settings.oauthClients).toBe("developers")
    expect(plugin.localization).toMatchObject({
      allow: "Approve",
      cancel: oauthProviderLocalization.cancel
    })
  })

  it("passes the scope metadata source through untouched", () => {
    const resolver = () => undefined

    expect(oauthProviderPlugin({ scopeMetadata: resolver }).scopeMetadata).toBe(
      resolver
    )
    expect(oauthProviderPlugin().scopeMetadata).toBeUndefined()
  })

  it("enables personal client settings when a manager is provided", () => {
    const clientManager = {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      rotateSecret: vi.fn()
    }

    const plugin = oauthProviderPlugin({ clientManager })

    expect(plugin.clientManagement).toBe(true)
    expect(plugin.clientManager).toBe(clientManager)
  })

  it("parses and deduplicates scopes and prompts", () => {
    expect(
      parseOAuthAuthorizationRequest(
        "?client_id=client-123&scope=openid%20email%20openid&prompt=login%20consent&sig=signed"
      )
    ).toEqual({
      clientId: "client-123",
      scopes: ["openid", "email"],
      prompts: ["login", "consent"]
    })
  })

  it("treats blank request values as absent", () => {
    expect(
      parseOAuthAuthorizationRequest("?client_id=%20%20&scope=%20%20")
    ).toEqual({
      clientId: undefined,
      scopes: [],
      prompts: []
    })
  })

  it("matches individual prompts inside the space-separated set", () => {
    const request = parseOAuthAuthorizationRequest(
      "?prompt=select_account%20create"
    )

    expect(hasOAuthPrompt(request, "create")).toBe(true)
    expect(hasOAuthPrompt(request, "select_account")).toBe(true)
    expect(hasOAuthPrompt(request, "consent")).toBe(false)
  })

  it("allows web URLs and rejects unsafe client metadata URLs", () => {
    expect(sanitizeOAuthClientUrl("https://client.example/privacy")).toBe(
      "https://client.example/privacy"
    )
    expect(sanitizeOAuthClientUrl("http://localhost:3000/logo.svg")).toBe(
      "http://localhost:3000/logo.svg"
    )
    expect(sanitizeOAuthClientUrl("javascript:alert(1)")).toBeUndefined()
    expect(sanitizeOAuthClientUrl("not a url")).toBeUndefined()
  })

  it("keeps query and mutation keys under the auth namespace", () => {
    expect(oauthProviderQueryKeys.publicClient("client-123")).toEqual([
      "auth",
      "oauthProvider",
      "publicClient",
      "client-123"
    ])
    expect(oauthProviderQueryKeys.consents("user-1")).toEqual([
      "auth",
      "user",
      "user-1",
      "oauthProvider",
      "consents"
    ])
    expect(oauthProviderMutationKeys.consent).toEqual([
      "auth",
      "oauthProvider",
      "consent"
    ])
    expect(oauthProviderMutationKeys.continue).toEqual([
      "auth",
      "oauthProvider",
      "continue"
    ])
    expect(oauthProviderMutationKeys.deleteConsent).toEqual([
      "auth",
      "oauthProvider",
      "deleteConsent"
    ])
    expect(oauthProviderQueryKeys.clients("organization:org-1:acme")).toEqual([
      "auth",
      "oauthProvider",
      "clients",
      "organization:org-1:acme"
    ])
  })

  it("scopes consent queries per user so caches cannot leak", () => {
    expect(oauthProviderQueryKeys.listConsents("user-1")).not.toEqual(
      oauthProviderQueryKeys.listConsents("user-2")
    )
  })
})

describe("resolveOAuthScopeMetadata", () => {
  it("resolves from a keyed record", () => {
    expect(
      resolveOAuthScopeMetadata(
        { calendar: { label: "Calendar", description: "Read events." } },
        "calendar",
        context
      )
    ).toEqual({ label: "Calendar", description: "Read events." })
  })

  it("resolves from a static list", () => {
    const list: OAuthScopeMetadataDefinition[] = [
      { scope: "calendar", label: "Calendar" },
      { scope: "files", label: "Files" }
    ]

    expect(resolveOAuthScopeMetadata(list, "files", context)).toEqual({
      scope: "files",
      label: "Files"
    })
  })

  it("resolves from a resolver and hands it the request context", () => {
    const seen: unknown[] = []

    const metadata = resolveOAuthScopeMetadata(
      (scope, resolverContext) => {
        seen.push({ scope, resolverContext })

        return { label: `${resolverContext.clientId}:${scope}` }
      },
      "calendar",
      context
    )

    expect(metadata).toEqual({ label: "client-123:calendar" })
    expect(seen).toEqual([{ scope: "calendar", resolverContext: context }])
  })

  it("falls back to built-in metadata when a source does not resolve", () => {
    expect(
      resolveOAuthScopeMetadata(() => undefined, "email", context)
    ).toEqual(oauthProviderScopeMetadata.email)
    expect(resolveOAuthScopeMetadata({}, "openid", context)).toEqual(
      oauthProviderScopeMetadata.openid
    )
  })

  it("keeps unknown scopes visible under their raw value", () => {
    expect(
      resolveOAuthScopeMetadata(undefined, "custom:scope", context)
    ).toEqual({ label: "custom:scope" })
    expect(
      resolveOAuthScopeMetadata(() => undefined, "custom:scope", context)
    ).toEqual({ label: "custom:scope" })
  })

  it("never resolves a scope through Object.prototype", () => {
    // Scopes are attacker-controlled, so a plain index would hand back the
    // inherited value and render an unlabelled row for a scope the user is
    // still about to grant.
    for (const scope of [
      "constructor",
      "toString",
      "hasOwnProperty",
      "__proto__",
      "valueOf"
    ]) {
      for (const source of [undefined, {}, [] as const, () => undefined]) {
        expect(resolveOAuthScopeMetadata(source, scope, context)).toEqual({
          label: scope
        })
      }
    }
  })

  it("still resolves own keys that shadow prototype members", () => {
    expect(
      resolveOAuthScopeMetadata(
        { constructor: { label: "Build things" } },
        "constructor",
        context
      )
    ).toEqual({ label: "Build things" })
  })

  it("lets a consumer source override built-in metadata", () => {
    expect(
      resolveOAuthScopeMetadata(
        { email: { label: "Your email" } },
        "email",
        context
      )
    ).toEqual({ label: "Your email" })
  })
})

describe("groupOAuthConsents", () => {
  const older = new Date("2026-01-01T00:00:00.000Z")
  const newer = new Date("2026-04-01T00:00:00.000Z")

  it("renders duplicate consent rows for one client as a single application", () => {
    const applications = groupOAuthConsents([
      {
        id: "consent-1",
        clientId: "client-a",
        scopes: ["openid", "email"],
        updatedAt: older
      },
      {
        id: "consent-2",
        clientId: "client-a",
        scopes: ["email", "calendar"],
        updatedAt: newer
      },
      { id: "consent-3", clientId: "client-b", scopes: ["openid"] }
    ])

    expect(applications).toHaveLength(2)
    expect(applications[0]).toEqual({
      clientId: "client-a",
      consentIds: ["consent-1", "consent-2"],
      scopes: ["openid", "email", "calendar"],
      updatedAt: newer
    })
    expect(applications[1].consentIds).toEqual(["consent-3"])
  })

  it("keeps the most recent timestamp regardless of record order", () => {
    const [application] = groupOAuthConsents([
      { id: "a", clientId: "client-a", updatedAt: newer },
      { id: "b", clientId: "client-a", updatedAt: older }
    ])

    expect(application.updatedAt).toEqual(newer)
  })

  it("accepts serialized dates and falls back to createdAt", () => {
    const [application] = groupOAuthConsents([
      { id: "a", clientId: "client-a", createdAt: older.toISOString() }
    ])

    expect(application.updatedAt).toEqual(older)
  })

  it("leaves updatedAt unset when no record carries a usable date", () => {
    const [application] = groupOAuthConsents([
      { id: "a", clientId: "client-a", updatedAt: "not a date" }
    ])

    expect(application.updatedAt).toBeUndefined()
  })

  it("handles an empty or missing list", () => {
    expect(groupOAuthConsents([])).toEqual([])
    expect(groupOAuthConsents(undefined)).toEqual([])
  })
})
