import { describe, expect, it } from "vitest"
import {
  oauthProviderLocalization,
  oauthProviderMutationKeys,
  oauthProviderPlugin,
  oauthProviderQueryKeys,
  oauthProviderScopeMetadata,
  parseOAuthAuthorizationRequest,
  sanitizeOAuthClientUrl
} from "../src/plugins"

describe("oauthProviderPlugin", () => {
  it("provides a stable consent view and scope metadata", () => {
    const plugin = oauthProviderPlugin()

    expect(oauthProviderPlugin.id).toBe("oauthProvider")
    expect(plugin).toMatchObject({
      id: "oauthProvider",
      localization: oauthProviderLocalization,
      scopeMetadata: oauthProviderScopeMetadata,
      viewPaths: {
        auth: {
          oauthConsent: "consent"
        }
      }
    })
  })

  it("merges path, localization, and custom scope metadata", () => {
    const plugin = oauthProviderPlugin({
      path: "authorize",
      localization: {
        allow: "Approve"
      },
      scopeMetadata: {
        calendar: {
          label: "View your calendar"
        }
      }
    })

    expect(plugin.viewPaths.auth.oauthConsent).toBe("authorize")
    expect(plugin.localization).toMatchObject({
      allow: "Approve",
      cancel: oauthProviderLocalization.cancel
    })
    expect(plugin.scopeMetadata).toMatchObject({
      openid: oauthProviderScopeMetadata.openid,
      calendar: {
        label: "View your calendar"
      }
    })
  })

  it("parses and deduplicates the authorization request", () => {
    expect(
      parseOAuthAuthorizationRequest(
        "?client_id=client-123&scope=openid%20email%20openid&sig=signed"
      )
    ).toEqual({
      clientId: "client-123",
      scopes: ["openid", "email"]
    })
  })

  it("treats blank request values as absent", () => {
    expect(
      parseOAuthAuthorizationRequest("?client_id=%20%20&scope=%20%20")
    ).toEqual({
      clientId: undefined,
      scopes: []
    })
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
    expect(oauthProviderMutationKeys.consent).toEqual([
      "auth",
      "oauthProvider",
      "consent"
    ])
  })
})
