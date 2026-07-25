import { deviceAuthorizationMutationKeys } from "@better-auth-ui/core/plugins"
import type { DeviceAuthorizationAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type ApproveDeviceParams<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Parameters<TAuthClient["device"]["approve"]>[0]

export function approveDeviceOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.device.approve,
    deviceAuthorizationMutationKeys.approve
  )
}
