import {
  type GetTotpUriOptions,
  getTotpUriOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useGetTotpUri<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: GetTotpUriOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    { ...getTotpUriOptions(authClient), ...options },
    queryClient
  )
}
