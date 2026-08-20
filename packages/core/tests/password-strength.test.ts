import { describe, expect, it } from "vitest"
import {
  evaluatePasswordStrength,
  isPasswordCompromisedError
} from "../src/lib/password-strength"

const level = (password: string, minLength?: number) =>
  evaluatePasswordStrength(password, { minLength }).level

describe("evaluatePasswordStrength", () => {
  it("reports nothing for an empty box", () => {
    expect(evaluatePasswordStrength("")).toEqual({ score: 0, level: "empty" })
  })

  it("caps anything under the form's own minimum at weak", () => {
    expect(level("Aa1!", 12)).toBe("weak")
    // The same password clears a shorter minimum and scores on its merits.
    expect(level("Aa1!xyzQ", 8)).not.toBe("weak")
  })

  it("rewards length and character variety together", () => {
    expect(level("aaaaaaaaaaaa")).toBe("weak")
    expect(level("correcthorse")).toBe("fair")
    expect(level("correctHorse1")).toBe("good")
    expect(level("correctHorseBattery1!")).toBe("strong")
  })

  it("marks down keyboard and alphabet runs", () => {
    // Same length and character classes; only the run differs.
    const withRun = evaluatePasswordStrength("Qwerty12!x").score
    const withoutRun = evaluatePasswordStrength("Qxmzpt91!k").score

    expect(withRun).toBeLessThan(withoutRun)
  })
})

describe("isPasswordCompromisedError", () => {
  it("matches the plugin's rejection in both shapes", () => {
    expect(isPasswordCompromisedError({ code: "PASSWORD_COMPROMISED" })).toBe(
      true
    )
    expect(
      isPasswordCompromisedError({ error: { code: "PASSWORD_COMPROMISED" } })
    ).toBe(true)
  })

  it("ignores anything else", () => {
    expect(isPasswordCompromisedError({ error: { code: "BAD_REQUEST" } })).toBe(
      false
    )
    expect(isPasswordCompromisedError(null)).toBe(false)
    expect(isPasswordCompromisedError("PASSWORD_COMPROMISED")).toBe(false)
  })
})
