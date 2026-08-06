import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { DeviceAuthorizationAuthClient } from "./device-authorization-auth-client"
import { deviceAuthorizationMutationKeys } from "./device-authorization-mutation-keys"

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
 * Mutation options factory for verifying and claiming a device code.
 *
 * @param authClient - The Better Auth client with the device-authorization plugin.
 */
export function verifyDeviceCodeOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
>(authClient: TAuthClient) {
  const mutationKey = deviceAuthorizationMutationKeys.verify

  const mutationFn = (params: VerifyDeviceCodeParams<TAuthClient>) =>
    authClient.device({
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
