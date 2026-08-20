import { describe, expect, it, vi } from "vitest"
import { authQueryKeys } from "../src"
import {
  createPhoneNumberValue,
  defaultPhoneNumberAdapter,
  getPhoneNumberCountries,
  phoneNumberLocalization,
  phoneNumberMutationKeys,
  phoneNumberPlugin,
  requestPhoneNumberPasswordResetOptions,
  resetPhoneNumberPasswordOptions,
  sendPhoneNumberOtpOptions,
  signInPhoneNumberOptions,
  verifyPhoneNumberOptions
} from "../src/plugins/phone-number"

type MutationOptions = {
  meta?: { awaits?: readonly unknown[] }
  mutationFn: (variables: unknown) => Promise<unknown>
  mutationKey: readonly unknown[]
}

describe("phoneNumberPlugin", () => {
  it("enables code sign-in and account settings by default", () => {
    expect(phoneNumberPlugin.id).toBe("phoneNumber")
    expect(phoneNumberPlugin()).toMatchObject({
      id: "phoneNumber",
      adapter: defaultPhoneNumberAdapter,
      defaultCountry: "US",
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
      countries: ["CH", "DE"],
      defaultCountry: "CH",
      locale: "de-CH",
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
    expect(plugin.countries).toEqual(["CH", "DE"])
    expect(plugin.defaultCountry).toBe("CH")
    expect(plugin.locale).toBe("de-CH")
    expect(plugin.signIn).toBe(false)
    expect(plugin.passwordSignIn).toBe(true)
    expect(plugin.passwordReset).toBe(true)
    expect(plugin.changePhoneNumber).toBe(false)
    expect(plugin.localization).toMatchObject({
      sendCode: "Text me a code",
      phoneNumber: phoneNumberLocalization.phoneNumber
    })
  })

  it("uses the first configured country when the default is omitted", () => {
    expect(phoneNumberPlugin({ countries: ["CH", "DE"] })).toMatchObject({
      countries: ["CH", "DE"],
      defaultCountry: "CH"
    })
  })

  it("rejects empty or inconsistent country configuration", () => {
    expect(() => phoneNumberPlugin({ countries: [] })).toThrow(
      "countries must include at least one country"
    )
    expect(() =>
      phoneNumberPlugin({ countries: ["CH", "DE"], defaultCountry: "US" })
    ).toThrow("defaultCountry must be included in countries")
  })

  it("normalizes code length boundaries", () => {
    expect(phoneNumberPlugin({ otpLength: Number.NaN }).otpLength).toBe(6)
    expect(phoneNumberPlugin({ otpLength: 0 }).otpLength).toBe(1)
    expect(phoneNumberPlugin({ otpLength: -4 }).otpLength).toBe(1)
  })

  it("formats and normalizes national numbers to E.164", () => {
    expect(createPhoneNumberValue("2025550123", "US")).toEqual({
      country: "US",
      display: "(202) 555-0123",
      e164: "+12025550123",
      isValid: true
    })
    expect(createPhoneNumberValue("020 7946 0018", "GB")).toMatchObject({
      country: "GB",
      e164: "+442079460018",
      isValid: true
    })
  })

  it("keeps invalid input visible without producing an E.164 value", () => {
    expect(createPhoneNumberValue("123", "US")).toMatchObject({
      country: "US",
      display: "1 23",
      isValid: false
    })
    expect(createPhoneNumberValue("123", "US").e164).toBeUndefined()
  })

  it("localizes and limits the country list", () => {
    expect(getPhoneNumberCountries("de", ["US", "DE"])).toEqual([
      { callingCode: "+49", code: "DE", label: "Deutschland" },
      {
        callingCode: "+1",
        code: "US",
        label: "Vereinigte Staaten"
      }
    ])
  })

  it("falls back to English names and sorting for an invalid locale", () => {
    expect(getPhoneNumberCountries("invalid locale", ["US", "DE"])).toEqual([
      { callingCode: "+49", code: "DE", label: "Germany" },
      { callingCode: "+1", code: "US", label: "United States" }
    ])
  })

  it("keeps password sign-in under the shared sign-in namespace", () => {
    expect(phoneNumberMutationKeys.signIn).toEqual([
      "auth",
      "signIn",
      "phoneNumber"
    ])
  })

  it("routes every mutation payload to the matching Better Auth method", async () => {
    const sendOtp = vi.fn(async () => ({ status: true }))
    const verify = vi.fn(async () => ({ token: "session" }))
    const requestPasswordReset = vi.fn(async () => ({ status: true }))
    const resetPassword = vi.fn(async () => ({ status: true }))
    const signIn = vi.fn(async () => ({ token: "session" }))
    const authClient = {
      phoneNumber: {
        requestPasswordReset,
        resetPassword,
        sendOtp,
        verify
      },
      signIn: { phoneNumber: signIn }
    }
    const mutations = [
      [
        sendPhoneNumberOtpOptions(authClient as never),
        { phoneNumber: "+12025550123" },
        sendOtp
      ],
      [
        verifyPhoneNumberOptions(authClient as never),
        { phoneNumber: "+12025550123", code: "123456" },
        verify
      ],
      [
        requestPhoneNumberPasswordResetOptions(authClient as never),
        { phoneNumber: "+12025550123" },
        requestPasswordReset
      ],
      [
        resetPhoneNumberPasswordOptions(authClient as never),
        {
          phoneNumber: "+12025550123",
          otp: "123456",
          newPassword: "correct horse battery staple"
        },
        resetPassword
      ],
      [
        signInPhoneNumberOptions(authClient as never),
        {
          phoneNumber: "+12025550123",
          password: "correct horse battery staple"
        },
        signIn
      ]
    ] as const

    for (const [mutation, variables, method] of mutations) {
      await (mutation as MutationOptions).mutationFn(variables)
      expect(method).toHaveBeenCalledWith({
        ...variables,
        fetchOptions: { throw: true }
      })
    }
  })

  it("marks session-producing mutations for awaited refresh", () => {
    const authClient = {
      phoneNumber: {
        requestPasswordReset: vi.fn(),
        resetPassword: vi.fn(),
        sendOtp: vi.fn(),
        verify: vi.fn()
      },
      signIn: { phoneNumber: vi.fn() }
    }

    expect(
      (
        verifyPhoneNumberOptions(authClient as never)
          .meta as MutationOptions["meta"]
      )?.awaits
    ).toEqual([authQueryKeys.session])
    expect(
      (
        signInPhoneNumberOptions(authClient as never)
          .meta as MutationOptions["meta"]
      )?.awaits
    ).toEqual([authQueryKeys.session])
  })
})
