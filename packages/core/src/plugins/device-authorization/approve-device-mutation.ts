import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { DeviceAuthorizationAuthClient } from "./device-authorization-auth-client"
import { deviceAuthorizationMutationKeys } from "./device-authorization-mutation-keys"

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
  const mutationKey = deviceAuthorizationMutationKeys.approve

  const mutationFn = (params: ApproveDeviceParams<TAuthClient>) =>
    authClient.device.approve({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
