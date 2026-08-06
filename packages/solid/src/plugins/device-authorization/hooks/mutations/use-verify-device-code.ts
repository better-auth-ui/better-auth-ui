import {
  type DeviceAuthorizationAuthClient,
  type VerifyDeviceCodeOptions,
  verifyDeviceCodeOptions
} from "@better-auth-ui/core/plugins/device-authorization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseVerifyDeviceCodeOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Accessor<VerifyDeviceCodeOptions<TAuthClient>>

export function useVerifyDeviceCode<
  TAuthClient extends DeviceAuthorizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseVerifyDeviceCodeOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...verifyDeviceCodeOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
