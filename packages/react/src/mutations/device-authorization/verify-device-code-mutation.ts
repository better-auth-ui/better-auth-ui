import { deviceAuthorizationMutationKeys } from "@better-auth-ui/core/plugins"
import { useMutation } from "@tanstack/react-query"

import type { DeviceAuthorizationAuthClient } from "../../lib/auth-client"
import { authMutationOptions } from "../auth-mutation-options"

export type VerifyDeviceCodeParams<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Parameters<TAuthClient["device"]>[0]

export type VerifyDeviceCodeOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Omit<
  ReturnType<typeof verifyDeviceCodeOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for verifying and claiming a device user code.
 *
 * The Better Auth endpoint uses GET, but this operation is modeled as a
 * mutation because verification binds the code to the current session.
 *
 * @param authClient - The Better Auth client with the device-authorization plugin.
 */
export function verifyDeviceCodeOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
>(authClient: TAuthClient) {
  return authMutationOptions(
    authClient.device,
    deviceAuthorizationMutationKeys.verify
  )
}

/**
 * Create a mutation for verifying and claiming a device user code.
 *
 * @param authClient - The Better Auth client with the device-authorization plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useVerifyDeviceCode<
  TAuthClient extends DeviceAuthorizationAuthClient
>(authClient: TAuthClient, options?: VerifyDeviceCodeOptions<TAuthClient>) {
  return useMutation({
    ...verifyDeviceCodeOptions(authClient),
    ...options
  })
}
