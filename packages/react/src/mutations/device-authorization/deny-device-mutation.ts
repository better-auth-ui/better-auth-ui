import { deviceAuthorizationMutationKeys } from "@better-auth-ui/core/plugins"
import { useMutation } from "@tanstack/react-query"

import type { DeviceAuthorizationAuthClient } from "../../lib/auth-client"
import { authMutationOptions } from "../auth-mutation-options"

export type DenyDeviceParams<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Parameters<TAuthClient["device"]["deny"]>[0]

export type DenyDeviceOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Omit<
  ReturnType<typeof denyDeviceOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for denying a pending device request.
 *
 * @param authClient - The Better Auth client with the device-authorization plugin.
 */
export function denyDeviceOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
>(authClient: TAuthClient) {
  return authMutationOptions(
    authClient.device.deny,
    deviceAuthorizationMutationKeys.deny
  )
}

/**
 * Create a mutation for denying a pending device request.
 *
 * @param authClient - The Better Auth client with the device-authorization plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useDenyDevice<
  TAuthClient extends DeviceAuthorizationAuthClient
>(authClient: TAuthClient, options?: DenyDeviceOptions<TAuthClient>) {
  return useMutation({
    ...denyDeviceOptions(authClient),
    ...options
  })
}
