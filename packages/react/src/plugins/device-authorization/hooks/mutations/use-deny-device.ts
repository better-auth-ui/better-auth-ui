import {
  type DenyDeviceOptions,
  type DeviceAuthorizationAuthClient,
  denyDeviceOptions
} from "@better-auth-ui/core/plugins/device-authorization"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useDenyDevice<
  TAuthClient extends DeviceAuthorizationAuthClient
>(
  authClient: TAuthClient,
  options?: DenyDeviceOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...denyDeviceOptions(authClient),
      ...options
    },
    queryClient
  )
}
