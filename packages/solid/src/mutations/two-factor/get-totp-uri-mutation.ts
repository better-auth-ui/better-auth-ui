import {
  type GetTotpUriOptions,
  getTotpUriOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseGetTotpUriOptions<TAuthClient extends TwoFactorAuthClient> =
  Accessor<GetTotpUriOptions<TAuthClient>>

export function useGetTotpUri<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: UseGetTotpUriOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...getTotpUriOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
