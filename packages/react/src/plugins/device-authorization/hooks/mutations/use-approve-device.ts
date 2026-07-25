import {
  type ApproveDeviceOptions,
  approveDeviceOptions,
  type DeviceAuthorizationAuthClient
} from "@better-auth-ui/core/plugins/device-authorization"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useApproveDevice<
  TAuthClient extends DeviceAuthorizationAuthClient
>(
  authClient: TAuthClient,
  options?: ApproveDeviceOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...approveDeviceOptions(authClient),
      ...options
    },
    queryClient
  )
}
