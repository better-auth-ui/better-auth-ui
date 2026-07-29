import { describe, expect, it } from "vitest"
import {
  getAuthLinkURL,
  getAuthRedirectAction,
  getSafeRedirectTo,
  getViewURL
} from "../src/lib/auth-redirect"

const origin = "https://app.example.com"

describe("getAuthLinkURL", () => {
  it("preserves redirect targets and existing URL details", () => {
    expect(
      getAuthLinkURL(
        "/auth/sign-in?mode=password#form",
        "/projects/acme?tab=members"
      )
    ).toBe(
      "/auth/sign-in?mode=password&redirectTo=%2Fprojects%2Facme%3Ftab%3Dmembers#form"
    )
  })
})

describe("getSafeRedirectTo", () => {
  it("preserves root-relative paths, queries, and hashes", () => {
    expect(
      getSafeRedirectTo(
        "/api/auth/delete-user/callback?token=abc#complete",
        origin
      )
    ).toBe("/api/auth/delete-user/callback?token=abc#complete")
  })

  it("normalizes same-origin absolute URLs to paths", () => {
    expect(
      getSafeRedirectTo(
        "https://app.example.com/settings/account?tab=security#sessions",
        origin
      )
    ).toBe("/settings/account?tab=security#sessions")
  })

  it.each([
    ["https://attacker.example/delete", "cross-origin URLs"],
    ["//attacker.example/delete", "protocol-relative URLs"],
    ["javascript:alert(1)", "non-HTTP schemes"],
    ["settings/account", "relative paths"],
    ["/\\attacker.example/delete", "backslashes"],
    ["https://user:password@app.example.com/delete", "credentials"],
    ["/settings\n/account", "control characters"]
  ])("rejects %s (%s)", (target) => {
    expect(getSafeRedirectTo(target, origin)).toBe("/")
  })
})

describe("getViewURL", () => {
  it("combines an origin, custom base path, and view path", () => {
    expect(getViewURL("https://example.com/", "/profile/", "/personal/")).toBe(
      "https://example.com/profile/personal"
    )
  })

  it("returns a root-relative path when no origin is configured", () => {
    expect(getViewURL("", "/login", "new-password")).toBe("/login/new-password")
  })
})

describe("getAuthRedirectAction", () => {
  it("continues authenticated users to the validated target", () => {
    const action = getAuthRedirectAction(
      new URL(
        `${origin}/auth/redirect?redirectTo=%2Fapi%2Fauth%2Fdelete-user%2Fcallback%3Ftoken%3Dabc`
      ),
      true,
      "/auth/sign-in"
    )

    expect(action).toEqual({
      type: "redirect",
      to: "/api/auth/delete-user/callback?token=abc"
    })
  })

  it("returns signed-out users to the redirect view after sign in", () => {
    const currentURL = new URL(
      `${origin}/auth/redirect?redirectTo=%2Fsettings%2Faccount#security`
    )
    const action = getAuthRedirectAction(currentURL, false, "/auth/sign-in")

    expect(action.type).toBe("signIn")
    const signInURL = new URL(action.to, origin)
    expect(signInURL.pathname).toBe("/auth/sign-in")
    expect(signInURL.searchParams.get("redirectTo")).toBe(
      "/auth/redirect?redirectTo=%2Fsettings%2Faccount#security"
    )
  })

  it("prevents redirect-view loops", () => {
    const action = getAuthRedirectAction(
      new URL(
        `${origin}/auth/redirect?redirectTo=%2Fauth%2Fredirect%3FredirectTo%3D%252Fsettings`
      ),
      true,
      "/auth/sign-in"
    )

    expect(action).toEqual({ type: "redirect", to: "/" })
  })
})
