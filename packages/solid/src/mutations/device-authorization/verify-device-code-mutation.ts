import { deviceAuthorizationMutationKeys } from "@better-auth-ui/core/plugins"
import type { DeviceAuthorizationAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type VerifyDeviceCodeParams<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Parameters<TAuthClient["device"]>[0]

export function verifyDeviceCodeOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.device,
    deviceAuthorizationMutationKeys.verify
  )
}
