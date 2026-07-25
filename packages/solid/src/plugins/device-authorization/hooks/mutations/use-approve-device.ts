import {
  type ApproveDeviceOptions,
  approveDeviceOptions,
  type DeviceAuthorizationAuthClient
} from "@better-auth-ui/core/plugins/device-authorization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseApproveDeviceOptions<
  TAuthClient extends DeviceAuthorizationAuthClient
> = Accessor<ApproveDeviceOptions<TAuthClient>>

export function useApproveDevice<
  TAuthClient extends DeviceAuthorizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseApproveDeviceOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...approveDeviceOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
