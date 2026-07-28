import { authQueryKeys } from "@better-auth-ui/core"
import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import type { PhoneNumberAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type VerifyPhoneNumberParams<TAuthClient extends PhoneNumberAuthClient> =
  Parameters<TAuthClient["phoneNumber"]["verify"]>[0]

/** Mutation options factory for verifying a phone-number code. */
export function verifyPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.phoneNumber.verify,
    phoneNumberMutationKeys.verify,
    { awaits: [authQueryKeys.session] }
  )
}
