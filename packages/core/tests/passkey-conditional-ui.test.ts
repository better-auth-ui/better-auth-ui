import { afterEach, describe, expect, it, vi } from "vitest"
import {
  isConditionalMediationAvailable,
  isPasskeyAutoFillEnabled,
  passkeyPlugin,
  withPasskeyAutoFill
} from "../src/plugins/passkey"

const stubPublicKeyCredential = (
  value: Pick<
    typeof PublicKeyCredential,
    "isConditionalMediationAvailable"
  > | null
) => {
  vi.stubGlobal("window", value ? { PublicKeyCredential: value } : {})
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("withPasskeyAutoFill", () => {
  it("appends the webauthn token last so browsers honour it", () => {
    expect(withPasskeyAutoFill("email", true)).toBe("email webauthn")
    expect(withPasskeyAutoFill("username email", true)).toBe(
      "username email webauthn"
    )
  })

  it("leaves the value alone when disabled", () => {
    expect(withPasskeyAutoFill("email", false)).toBe("email")
  })

  it("keeps one canonical webauthn token in the final position", () => {
    expect(withPasskeyAutoFill("email webauthn", true)).toBe("email webauthn")
    expect(withPasskeyAutoFill("WebAuthn\temail webauthn", true)).toBe(
      "email webauthn"
    )
  })
})

describe("isPasskeyAutoFillEnabled", () => {
  it("defaults to on, and follows the plugin option", () => {
    expect(isPasskeyAutoFillEnabled([passkeyPlugin()])).toBe(true)
    expect(isPasskeyAutoFillEnabled([passkeyPlugin({ autoFill: false })])).toBe(
      false
    )
  })

  it("is off when the passkey plugin isn't registered", () => {
    expect(isPasskeyAutoFillEnabled([])).toBe(false)
  })
})

describe("isConditionalMediationAvailable", () => {
  it("resolves false when the browser lacks the feature probe", async () => {
    stubPublicKeyCredential(null)

    await expect(isConditionalMediationAvailable()).resolves.toBe(false)
  })

  it("resolves false when the probe throws", async () => {
    stubPublicKeyCredential({
      isConditionalMediationAvailable: () => {
        throw new Error("nope")
      }
    })

    await expect(isConditionalMediationAvailable()).resolves.toBe(false)
  })

  it("passes the browser's answer through", async () => {
    stubPublicKeyCredential({
      isConditionalMediationAvailable: () => Promise.resolve(true)
    })

    await expect(isConditionalMediationAvailable()).resolves.toBe(true)
  })
})
