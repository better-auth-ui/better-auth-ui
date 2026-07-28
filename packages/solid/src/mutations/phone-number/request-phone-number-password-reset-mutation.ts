import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import type { PhoneNumberAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type RequestPhoneNumberPasswordResetParams<
  TAuthClient extends PhoneNumberAuthClient
> = Parameters<TAuthClient["phoneNumber"]["requestPasswordReset"]>[0]

/** Mutation options factory for sending a phone password-reset code. */
export function requestPhoneNumberPasswordResetOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.phoneNumber.requestPasswordReset,
    phoneNumberMutationKeys.requestPasswordReset
  )
}
