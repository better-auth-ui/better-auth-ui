import { authQueryKeys } from "@better-auth-ui/core"
import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import { describe, expect, it, vi } from "vitest"

import {
  requestPhoneNumberPasswordResetOptions,
  resetPhoneNumberPasswordOptions,
  sendPhoneNumberOtpOptions,
  signInPhoneNumberOptions,
  verifyPhoneNumberOptions
} from "../src"

type MutationOptions = {
  meta?: { awaits?: readonly unknown[] }
  mutationFn: (variables: unknown) => Promise<unknown>
  mutationKey: readonly unknown[]
}

describe("phone-number mutation options", () => {
  it("routes every payload to the matching Better Auth method", async () => {
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

    const options = [
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

    for (const [mutation, variables, method] of options) {
      await (mutation as MutationOptions).mutationFn(variables)
      expect(method).toHaveBeenCalledWith({
        ...variables,
        fetchOptions: { throw: true }
      })
    }
  })

  it("marks session-producing operations for awaited refresh", () => {
    const authClient = {
      phoneNumber: {
        requestPasswordReset: vi.fn(),
        resetPassword: vi.fn(),
        sendOtp: vi.fn(),
        verify: vi.fn()
      },
      signIn: { phoneNumber: vi.fn() }
    }

    expect(sendPhoneNumberOtpOptions(authClient as never).mutationKey).toEqual(
      phoneNumberMutationKeys.sendOtp
    )
    expect(
      requestPhoneNumberPasswordResetOptions(authClient as never).mutationKey
    ).toEqual(phoneNumberMutationKeys.requestPasswordReset)
    expect(
      resetPhoneNumberPasswordOptions(authClient as never).mutationKey
    ).toEqual(phoneNumberMutationKeys.resetPassword)
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
