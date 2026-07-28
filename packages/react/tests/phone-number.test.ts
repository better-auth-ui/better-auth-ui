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

    await (
      sendPhoneNumberOtpOptions(authClient as never) as MutationOptions
    ).mutationFn({ phoneNumber: "+12025550123" })
    await (
      verifyPhoneNumberOptions(authClient as never) as MutationOptions
    ).mutationFn({ phoneNumber: "+12025550123", code: "123456" })
    await (
      requestPhoneNumberPasswordResetOptions(
        authClient as never
      ) as MutationOptions
    ).mutationFn({ phoneNumber: "+12025550123" })
    await (
      resetPhoneNumberPasswordOptions(authClient as never) as MutationOptions
    ).mutationFn({
      phoneNumber: "+12025550123",
      otp: "123456",
      newPassword: "correct horse battery staple"
    })
    await (
      signInPhoneNumberOptions(authClient as never) as MutationOptions
    ).mutationFn({
      phoneNumber: "+12025550123",
      password: "correct horse battery staple"
    })

    expect(sendOtp).toHaveBeenCalledWith({
      phoneNumber: "+12025550123",
      fetchOptions: { throw: true }
    })
    expect(verify).toHaveBeenCalledWith({
      phoneNumber: "+12025550123",
      code: "123456",
      fetchOptions: { throw: true }
    })
    expect(requestPasswordReset).toHaveBeenCalledWith({
      phoneNumber: "+12025550123",
      fetchOptions: { throw: true }
    })
    expect(resetPassword).toHaveBeenCalledWith({
      phoneNumber: "+12025550123",
      otp: "123456",
      newPassword: "correct horse battery staple",
      fetchOptions: { throw: true }
    })
    expect(signIn).toHaveBeenCalledWith({
      phoneNumber: "+12025550123",
      password: "correct horse battery staple",
      fetchOptions: { throw: true }
    })
  })

  it("uses stable plugin mutation keys", () => {
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
    expect(verifyPhoneNumberOptions(authClient as never).mutationKey).toEqual(
      phoneNumberMutationKeys.verify
    )
    expect(signInPhoneNumberOptions(authClient as never).mutationKey).toEqual(
      phoneNumberMutationKeys.signIn
    )
    expect(
      requestPhoneNumberPasswordResetOptions(authClient as never).mutationKey
    ).toEqual(phoneNumberMutationKeys.requestPasswordReset)
    expect(
      resetPhoneNumberPasswordOptions(authClient as never).mutationKey
    ).toEqual(phoneNumberMutationKeys.resetPassword)
  })
})
