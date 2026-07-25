import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { DeviceAuthorizationAuthClient } from "./device-authorization-auth-client"
import { deviceAuthorizationMutationKeys } from "./device-authorization-mutation-keys"

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
  const mutationKey = deviceAuthorizationMutationKeys.deny

  const mutationFn = (params: DenyDeviceParams<TAuthClient>) =>
    authClient.device.deny({
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
