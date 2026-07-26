import { describe, expect, it } from "vitest"
import {
  emailOtpLocalization,
  emailOtpMutationKeys,
  emailOtpPlugin
} from "../src/plugins"

describe("emailOtpPlugin", () => {
  it("enables sign-in only and leaves link-based flows alone", () => {
    expect(emailOtpPlugin.id).toBe("emailOtp")
    expect(emailOtpPlugin()).toMatchObject({
      id: "emailOtp",
      localization: emailOtpLocalization,
      otpLength: 6,
      signIn: true,
      emailVerification: false,
      passwordReset: false,
      changeEmail: false,
      verifyCurrentEmail: false,
      disableSignUp: true,
      viewPaths: { auth: { emailOtp: "email-otp" } }
    })
  })

  it("merges path, code length, and flow overrides", () => {
    const plugin = emailOtpPlugin({
      path: "code",
      otpLength: 8.9,
      signIn: false,
      passwordReset: true,
      localization: { sendCode: "Email me a code" }
    })

    expect(plugin.viewPaths.auth.emailOtp).toBe("code")
    expect(plugin.otpLength).toBe(8)
    expect(plugin.signIn).toBe(false)
    expect(plugin.passwordReset).toBe(true)
    expect(plugin.localization).toMatchObject({
      sendCode: "Email me a code",
      code: emailOtpLocalization.code
    })
  })

  it("normalizes code length boundaries", () => {
    expect(emailOtpPlugin({ otpLength: Number.NaN }).otpLength).toBe(6)
    expect(emailOtpPlugin({ otpLength: 0 }).otpLength).toBe(1)
    expect(emailOtpPlugin({ otpLength: -4 }).otpLength).toBe(1)
  })

  it("keeps sign-in under the shared sign-in namespace", () => {
    expect(emailOtpMutationKeys.signIn).toEqual(["auth", "signIn", "emailOtp"])
  })
})
