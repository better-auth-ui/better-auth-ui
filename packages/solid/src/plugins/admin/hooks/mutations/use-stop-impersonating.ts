import {
  type AdminAuthClient,
  type StopImpersonatingOptions,
  stopImpersonatingOptions
} from "@better-auth-ui/core/plugins/admin"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseStopImpersonatingOptions<TAuthClient extends AdminAuthClient> =
  Accessor<StopImpersonatingOptions<TAuthClient>>

export function useStopImpersonating<TAuthClient extends AdminAuthClient>(
  authClient: TAuthClient,
  options?: UseStopImpersonatingOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...stopImpersonatingOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
