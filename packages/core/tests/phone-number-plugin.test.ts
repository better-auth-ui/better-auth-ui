import { describe, expect, it } from "vitest"
import {
  phoneNumberLocalization,
  phoneNumberMutationKeys,
  phoneNumberPlugin
} from "../src/plugins"

describe("phoneNumberPlugin", () => {
  it("enables code sign-in and account settings by default", () => {
    expect(phoneNumberPlugin.id).toBe("phoneNumber")
    expect(phoneNumberPlugin()).toMatchObject({
      id: "phoneNumber",
      localization: phoneNumberLocalization,
      otpLength: 6,
      signIn: true,
      passwordSignIn: false,
      passwordReset: false,
      changePhoneNumber: true,
      viewPaths: {
        auth: {
          phoneNumber: "phone-number",
          phoneNumberForgotPassword: "phone-number-forgot-password",
          phoneNumberResetPassword: "phone-number-reset-password"
        }
      }
    })
  })

  it("merges paths, code length, flow options, and localization", () => {
    const plugin = phoneNumberPlugin({
      path: "phone",
      forgotPasswordPath: "phone-forgot",
      resetPasswordPath: "phone-reset",
      otpLength: 8.9,
      signIn: false,
      passwordSignIn: true,
      passwordReset: true,
      changePhoneNumber: false,
      localization: { sendCode: "Text me a code" }
    })

    expect(plugin.viewPaths.auth).toEqual({
      phoneNumber: "phone",
      phoneNumberForgotPassword: "phone-forgot",
      phoneNumberResetPassword: "phone-reset"
    })
    expect(plugin.otpLength).toBe(8)
    expect(plugin.signIn).toBe(false)
    expect(plugin.passwordSignIn).toBe(true)
    expect(plugin.passwordReset).toBe(true)
    expect(plugin.changePhoneNumber).toBe(false)
    expect(plugin.localization).toMatchObject({
      sendCode: "Text me a code",
      phoneNumber: phoneNumberLocalization.phoneNumber
    })
  })

  it("normalizes code length boundaries", () => {
    expect(phoneNumberPlugin({ otpLength: Number.NaN }).otpLength).toBe(6)
    expect(phoneNumberPlugin({ otpLength: 0 }).otpLength).toBe(1)
    expect(phoneNumberPlugin({ otpLength: -4 }).otpLength).toBe(1)
  })

  it("keeps password sign-in under the shared sign-in namespace", () => {
    expect(phoneNumberMutationKeys.signIn).toEqual([
      "auth",
      "signIn",
      "phoneNumber"
    ])
  })
})
