import { deviceAuthorizationMutationKeys } from "@better-auth-ui/core/plugins"
import type { DeviceAuthorizationAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type DenyDeviceParams<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Parameters<TAuthClient["device"]["deny"]>[0]

export function denyDeviceOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.device.deny,
    deviceAuthorizationMutationKeys.deny
  )
}
