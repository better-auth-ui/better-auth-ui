import { describe, expect, it } from "vitest"
import { getAuthErrorMessage } from "../src/lib/auth-error-message"
import { authMutationKeys } from "../src/lib/auth-mutation-keys"
import { localization } from "../src/lib/localization"
import { passkeyMutationKeys } from "../src/plugins/passkey/passkey-mutation-keys"
import { siweMutationKeys } from "../src/plugins/siwe/siwe-mutation-options"

const popup = authMutationKeys.signIn.popup
const passkey = passkeyMutationKeys.signIn

describe("auth error messages", () => {
  it("silences popup closure only in the popup flow", () => {
    const error = { code: "POPUP_CLOSED" }
    expect(getAuthErrorMessage(error, localization, popup)).toBeNull()
    expect(getAuthErrorMessage({ error }, localization, popup)).toBeNull()
    expect(getAuthErrorMessage(error, localization)).toBe(
      localization.errors.generic
    )
    expect(
      getAuthErrorMessage({ code: "POPUP_BLOCKED" }, localization, popup)
    ).toBe(localization.errors.popupBlocked)
    expect(
      getAuthErrorMessage({ code: "POPUP_TIMEOUT" }, localization, popup)
    ).toBe(localization.errors.popupTimeout)
  })

  it("only silences confirmed passkey aborts", () => {
    const error = { code: "ERROR_CEREMONY_ABORTED" }
    expect(getAuthErrorMessage({ error }, localization, passkey)).toBeNull()
    expect(
      getAuthErrorMessage(
        new DOMException("", "AbortError"),
        localization,
        passkey
      )
    ).toBeNull()
    expect(getAuthErrorMessage(error, localization)).toBe(
      localization.errors.generic
    )
    for (const code of [
      "AUTH_CANCELLED",
      "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      "ERROR_INVALID_RP_ID",
      "AUTHENTICATION_FAILED"
    ]) {
      expect(getAuthErrorMessage({ code }, localization, passkey)).toBe(
        localization.errors.passkeyFailed
      )
    }
    expect(
      getAuthErrorMessage(
        new DOMException("", "NotAllowedError"),
        localization,
        passkey
      )
    ).toBe(localization.errors.passkeyFailed)
  })

  it("recognizes wallet rejection through wrapped causes only for wallet prompts", () => {
    const error = new Error("", { cause: { code: 4001 } })
    for (const key of [siweMutationKeys.signIn, siweMutationKeys.link]) {
      expect(getAuthErrorMessage(error, localization, key)).toBeNull()
      expect(getAuthErrorMessage({ code: 4100 }, localization, key)).toBe(
        localization.errors.walletFailed
      )
    }
    expect(
      getAuthErrorMessage(error, localization, siweMutationKeys.unlink)
    ).toBe(localization.errors.generic)
    expect(getAuthErrorMessage(error, localization, popup)).toBe(
      localization.errors.generic
    )
  })

  it("uses supplied translations for known codes and hides server details", () => {
    const translated = {
      ...localization,
      errors: { ...localization.errors, invalidCredentials: "translated" }
    }
    expect(
      getAuthErrorMessage(
        {
          error: {
            code: "INVALID_EMAIL_OR_PASSWORD",
            message: "internal details"
          }
        },
        translated
      )
    ).toBe(translated.errors.invalidCredentials)
    for (const error of [
      undefined,
      null,
      "internal details",
      new Error("internal details"),
      { error: { code: "UNKNOWN", message: "internal details" } },
      { code: "__proto__" }
    ]) {
      expect(getAuthErrorMessage(error, localization)).toBe(
        localization.errors.generic
      )
    }
  })

  it("handles HTTP failures and cyclic causes without leaking details", () => {
    expect(getAuthErrorMessage({ status: 429 }, localization)).toBe(
      localization.errors.rateLimited
    )
    expect(getAuthErrorMessage({ status: 403 }, localization)).toBe(
      localization.errors.permissionDenied
    )
    const error: { cause?: unknown } = {}
    error.cause = error
    expect(
      getAuthErrorMessage(error, localization, siweMutationKeys.signIn)
    ).toBe(localization.errors.walletFailed)
  })
})
