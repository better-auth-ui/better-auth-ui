import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import type { PhoneNumberAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SendPhoneNumberOtpParams<
  TAuthClient extends PhoneNumberAuthClient
> = Parameters<TAuthClient["phoneNumber"]["sendOtp"]>[0]

/** Mutation options factory for sending a phone verification code. */
export function sendPhoneNumberOtpOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.phoneNumber.sendOtp,
    phoneNumberMutationKeys.sendOtp
  )
}
