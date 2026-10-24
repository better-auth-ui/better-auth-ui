import { createAuthClient } from "better-auth/client"
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
    const error = { code: "POPUP_CLOSED", message: "Popup closed" }
    expect(getAuthErrorMessage(error, localization, popup)).toBeNull()
    expect(getAuthErrorMessage({ error }, localization, popup)).toBeNull()
    expect(getAuthErrorMessage(error, localization)).toBe(error.message)
    expect(
      getAuthErrorMessage({ code: "POPUP_BLOCKED" }, localization, popup)
    ).toBe(localization.errors.popupBlocked)
    expect(
      getAuthErrorMessage({ code: "POPUP_TIMEOUT" }, localization, popup)
    ).toBe(localization.errors.popupTimeout)
  })

  it("only silences confirmed passkey aborts", () => {
    const error = { code: "ERROR_CEREMONY_ABORTED", message: "Aborted" }
    expect(getAuthErrorMessage({ error }, localization, passkey)).toBeNull()
    expect(
      getAuthErrorMessage(
        new DOMException("", "AbortError"),
        localization,
        passkey
      )
    ).toBeNull()
    expect(getAuthErrorMessage(error, localization)).toBe(error.message)
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
        {
          code: "AUTH_CANCELLED",
          message: "Auth cancelled",
          status: 400,
          statusText: "BAD_REQUEST"
        },
        localization,
        passkey
      )
    ).toBe(localization.errors.passkeyFailed)
    expect(
      getAuthErrorMessage(
        new DOMException("", "NotAllowedError"),
        localization,
        passkey
      )
    ).toBe(localization.errors.passkeyFailed)
  })

  it("recognizes wallet rejection through wrapped causes only for wallet prompts", () => {
    const error = new Error("Wallet request rejected", {
      cause: { code: 4001 }
    })
    for (const key of [siweMutationKeys.signIn, siweMutationKeys.link]) {
      expect(getAuthErrorMessage(error, localization, key)).toBeNull()
      expect(
        getAuthErrorMessage(
          { code: 4100, message: "Wallet is not authorized" },
          localization,
          key
        )
      ).toBe(localization.errors.walletFailed)
    }
    expect(
      getAuthErrorMessage(error, localization, siweMutationKeys.unlink)
    ).toBe(localization.errors.generic)
    expect(getAuthErrorMessage(error, localization, popup)).toBe(
      localization.errors.generic
    )
  })

  it.each([
    "INVALID_EMAIL_OR_PASSWORD",
    "USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION",
    "YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER",
    "ORGANIZATION_HAS_ACTIVE_SUBSCRIPTION",
    "YOU_CANNOT_BAN_YOURSELF"
  ])("preserves the server message for %s", (code) => {
    const error = { code, message: "Server message" }
    expect(getAuthErrorMessage(error, localization)).toBe(error.message)
    expect(getAuthErrorMessage({ error }, localization)).toBe(error.message)
  })

  it.each([false, true])(
    "preserves translated messages from the Better Auth client with throw=%s",
    async (throwError) => {
      const body = {
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Ungültige E-Mail oder Passwort",
        originalMessage: "Invalid email or password"
      }
      const client = createAuthClient({
        baseURL: "https://auth.example.com",
        fetchOptions: {
          customFetchImpl: async () =>
            Response.json(body, { status: 401, statusText: "Unauthorized" })
        }
      })
      const error = await client.signIn
        .email(
          { email: "user@example.com", password: "password" },
          { throw: throwError }
        )
        .then(
          (result) => result.error,
          (error: unknown) => error
        )

      expect(error).toBeTruthy()
      expect(getAuthErrorMessage(error, localization)).toBe(body.message)
    }
  )

  it.each([undefined, null, "", " \n ", 123])(
    "falls back to the original code when the message is %j",
    (message) => {
      const error = { code: "invalid_email_or_password", message, status: 403 }
      expect(getAuthErrorMessage(error, localization)).toBe(error.code)
      expect(getAuthErrorMessage({ error }, localization)).toBe(error.code)
    }
  )

  it("accepts a server message without an error code", () => {
    const error = { message: "Server message" }
    expect(getAuthErrorMessage(error, localization)).toBe(error.message)
    expect(getAuthErrorMessage({ error }, localization)).toBe(error.message)
  })

  it.each([
    { mutationKey: passkey },
    { mutationKey: siweMutationKeys.signIn },
    { mutationKey: siweMutationKeys.link }
  ])("preserves API errors within the $mutationKey flow", ({ mutationKey }) => {
    const error = {
      code: "SESSION_EXPIRED",
      message: "Server message",
      status: 401
    }
    expect(getAuthErrorMessage(error, localization, mutationKey)).toBe(
      error.message
    )
    expect(getAuthErrorMessage({ error }, localization, mutationKey)).toBe(
      error.message
    )
    const withoutMessage = { ...error, message: undefined }
    expect(getAuthErrorMessage(withoutMessage, localization, mutationKey)).toBe(
      error.code
    )
    expect(
      getAuthErrorMessage({ error: withoutMessage }, localization, mutationKey)
    ).toBe(error.code)
  })

  it("uses the generic fallback for missing details and network errors", () => {
    for (const error of [
      undefined,
      null,
      "unstructured failure",
      new Error("Unexpected failure"),
      new TypeError("Failed to fetch"),
      { message: " \n ", code: " " },
      { error: { message: 123, code: 456 } }
    ]) {
      expect(getAuthErrorMessage(error, localization)).toBe(
        localization.errors.generic
      )
    }
  })

  it("keeps localization for errors raised by the UI", () => {
    const error = Object.assign(new Error("Role has members"), {
      code: "ROLE_HAS_MEMBERS"
    })
    expect(getAuthErrorMessage(error, localization)).toBe(
      localization.errors.roleHasMembers
    )
  })

  it("handles HTTP failures without details and cyclic causes", () => {
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
