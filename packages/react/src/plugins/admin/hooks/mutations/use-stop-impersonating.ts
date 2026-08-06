import {
  type AdminAuthClient,
  type StopImpersonatingOptions,
  stopImpersonatingOptions
} from "@better-auth-ui/core/plugins/admin"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/**
 * Stop impersonating a user and restore the administrator's session.
 *
 * @param authClient - The Better Auth client with the admin plugin.
 * @param options - React Query options forwarded to `useMutation`.
 * @param queryClient - Optional custom `QueryClient`.
 */
export function useStopImpersonating<TAuthClient extends AdminAuthClient>(
  authClient: TAuthClient,
  options?: StopImpersonatingOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...stopImpersonatingOptions(authClient),
      ...options
    },
    queryClient
  )
}
