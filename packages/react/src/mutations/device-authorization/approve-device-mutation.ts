import { deviceAuthorizationMutationKeys } from "@better-auth-ui/core/plugins"
import { useMutation } from "@tanstack/react-query"

import type { DeviceAuthorizationAuthClient } from "../../lib/auth-client"
import { authMutationOptions } from "../auth-mutation-options"

export type ApproveDeviceParams<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Parameters<TAuthClient["device"]["approve"]>[0]

export type ApproveDeviceOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Omit<
  ReturnType<typeof approveDeviceOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for approving a pending device request.
 *
 * @param authClient - The Better Auth client with the device-authorization plugin.
 */
export function approveDeviceOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
>(authClient: TAuthClient) {
  return authMutationOptions(
    authClient.device.approve,
    deviceAuthorizationMutationKeys.approve
  )
}

/**
 * Create a mutation for approving a pending device request.
 *
 * @param authClient - The Better Auth client with the device-authorization plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useApproveDevice<
  TAuthClient extends DeviceAuthorizationAuthClient
>(authClient: TAuthClient, options?: ApproveDeviceOptions<TAuthClient>) {
  return useMutation({
    ...approveDeviceOptions(authClient),
    ...options
  })
}
