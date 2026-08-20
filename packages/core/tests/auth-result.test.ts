import { describe, expect, it } from "vitest"

import { getSafeAuthRedirect, parseAuthResult } from "../src"

describe("parseAuthResult", () => {
  it.each([
    ["?error=access_denied", "cancelled", "warning", "signIn"],
    [
      "?error=TOKEN_EXPIRED&flow=password-reset",
      "expiredLink",
      "danger",
      "forgotPassword"
    ],
    [
      "?error=account_already_linked_to_different_user",
      "accountLinkConflict",
      "danger",
      "accountSettings"
    ],
    ["?error=signup%20disabled", "signupDisabled", "danger", "signIn"],
    ["?error=invalid_callback_request", "callbackFailed", "danger", "signIn"],
    [
      "?error=&code=invalid_callback_request",
      "callbackFailed",
      "danger",
      "signIn"
    ]
  ] as const)("classifies %s", (search, reason, intent, action) => {
    expect(parseAuthResult(search)).toMatchObject({
      action,
      intent,
      reason
    })
  })

  it("classifies successful callback results and preserves local redirects", () => {
    expect(
      parseAuthResult(
        "?result=success&flow=email-verification&redirectTo=%2Fdashboard"
      )
    ).toEqual({
      action: "continue",
      flow: "emailVerification",
      intent: "success",
      reason: "emailVerified",
      redirectTo: "/dashboard"
    })
  })

  it("uses status when result is empty", () => {
    expect(
      parseAuthResult(
        "?result=%20&status=success&flow=email-verification&redirectTo=%2Fdashboard"
      )
    ).toEqual({
      action: "continue",
      flow: "emailVerification",
      intent: "success",
      reason: "emailVerified",
      redirectTo: "/dashboard"
    })
  })

  it("does not expose external callback redirects", () => {
    expect(getSafeAuthRedirect("https://example.com/phishing")).toBeUndefined()
    expect(getSafeAuthRedirect("//example.com/phishing")).toBeUndefined()
    expect(getSafeAuthRedirect("/\\example.com/phishing")).toBeUndefined()
    expect(
      parseAuthResult("?result=success&redirectTo=/%5Cexample.com/phishing")
        .redirectTo
    ).toBeUndefined()
    expect(getSafeAuthRedirect("/account?tab=security")).toBe(
      "/account?tab=security"
    )
  })
})
