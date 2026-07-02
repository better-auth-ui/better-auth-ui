import {
  type AuthClient,
  type SessionData,
  type SessionParams,
  sessionOptions
} from "@better-auth-ui/core"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSessionOptions<TAuthClient extends AuthClient> = Accessor<
  Omit<QueryOptions<SessionData<TAuthClient>>, "queryKey"> &
    SessionParams<TAuthClient>
>

export function useSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}

    return {
      ...sessionOptions(authClient, { query, fetchOptions }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
