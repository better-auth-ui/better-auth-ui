import {
  type DenyDeviceOptions,
  type DeviceAuthorizationAuthClient,
  denyDeviceOptions
} from "@better-auth-ui/core/plugins/device-authorization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseDenyDeviceOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Accessor<DenyDeviceOptions<TAuthClient>>

export function useDenyDevice<
  TAuthClient extends DeviceAuthorizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseDenyDeviceOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...denyDeviceOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
