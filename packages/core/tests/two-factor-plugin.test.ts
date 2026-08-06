import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { formatBackupCodesText } from "../src"
import {
  clearTwoFactorMethods,
  isTwoFactorRedirect,
  parseTwoFactorMethods,
  readTwoFactorMethods,
  storeTwoFactorMethods,
  TWO_FACTOR_METHODS_STORAGE_KEY,
  twoFactorLocalization,
  twoFactorPlugin
} from "../src/plugins/two-factor"

/** Minimal `sessionStorage` stand-in — this package is tested in Node. */
function createStorageStub() {
  const entries = new Map<string, string>()

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key)
  }
}

beforeEach(() => {
  vi.stubGlobal("sessionStorage", createStorageStub())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("twoFactorPlugin", () => {
  it("provides a stable auth view and matching defaults", () => {
    expect(twoFactorPlugin.id).toBe("twoFactor")
    expect(twoFactorPlugin()).toMatchObject({
      id: "twoFactor",
      codeLength: 6,
      backupCodes: true,
      trustDevice: true,
      allowPasswordless: false,
      viewPaths: { auth: { twoFactor: "two-factor" } }
    })
  })

  it("normalizes the code length", () => {
    expect(twoFactorPlugin({ codeLength: 8.7 }).codeLength).toBe(8)
    expect(twoFactorPlugin({ codeLength: Number.NaN }).codeLength).toBe(6)
    expect(twoFactorPlugin({ codeLength: 0 }).codeLength).toBe(1)
  })
})

describe("formatBackupCodesText", () => {
  it("includes the website, description, and codes in the exported text", () => {
    expect(
      formatBackupCodesText(
        ["code-1", "code-2"],
        twoFactorLocalization,
        "https://example.com"
      )
    ).toBe(
      [
        "Backup codes for https://example.com",
        "Save these somewhere safe. Each code works once if you lose your authenticator.",
        "",
        "code-1",
        "code-2"
      ].join("\n")
    )
  })
})

describe("two-factor challenge helpers", () => {
  it("detects the redirect payload sign-in returns instead of a session", () => {
    expect(
      isTwoFactorRedirect({ twoFactorRedirect: true, twoFactorMethods: [] })
    ).toBe(true)
    expect(isTwoFactorRedirect({ user: { id: "user-1" } })).toBe(false)
    expect(isTwoFactorRedirect({ twoFactorRedirect: false })).toBe(false)
    expect(isTwoFactorRedirect(null)).toBe(false)
  })

  it("keeps only methods the challenge view can render", () => {
    expect(parseTwoFactorMethods(["otp", "sms", "totp"])).toEqual([
      "totp",
      "otp"
    ])
    expect(parseTwoFactorMethods("totp")).toEqual([])
    expect(parseTwoFactorMethods()).toEqual([])
  })

  it("round-trips stored methods and falls back to every method", () => {
    storeTwoFactorMethods(["otp"])
    expect(sessionStorage.getItem(TWO_FACTOR_METHODS_STORAGE_KEY)).toBe(
      '["otp"]'
    )
    expect(readTwoFactorMethods()).toEqual(["otp"])

    clearTwoFactorMethods()
    expect(readTwoFactorMethods()).toEqual(["totp", "otp"])

    sessionStorage.setItem(TWO_FACTOR_METHODS_STORAGE_KEY, "not json")
    expect(readTwoFactorMethods()).toEqual(["totp", "otp"])

    storeTwoFactorMethods(["sms"])
    expect(readTwoFactorMethods()).toEqual(["totp", "otp"])
  })

  it("survives storage that throws, so sign-in still reaches the challenge", () => {
    const throwing = () => {
      throw new Error("storage disabled")
    }
    vi.stubGlobal("sessionStorage", {
      getItem: throwing,
      setItem: throwing,
      removeItem: throwing
    })

    expect(() => storeTwoFactorMethods(["totp"])).not.toThrow()
    expect(() => clearTwoFactorMethods()).not.toThrow()
    expect(readTwoFactorMethods()).toEqual(["totp", "otp"])
  })
})
