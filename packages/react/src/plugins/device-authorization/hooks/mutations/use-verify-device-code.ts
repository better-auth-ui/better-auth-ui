import {
  type DeviceAuthorizationAuthClient,
  type VerifyDeviceCodeOptions,
  verifyDeviceCodeOptions
} from "@better-auth-ui/core/plugins/device-authorization"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useVerifyDeviceCode<
  TAuthClient extends DeviceAuthorizationAuthClient
>(
  authClient: TAuthClient,
  options?: VerifyDeviceCodeOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...verifyDeviceCodeOptions(authClient),
      ...options
    },
    queryClient
  )
}
