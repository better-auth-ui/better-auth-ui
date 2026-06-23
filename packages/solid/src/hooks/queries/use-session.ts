import {
  type AuthClient,
  type SessionOptions,
  type SessionParams,
  sessionOptions
} from "@better-auth-ui/core"
import { useQuery } from "@tanstack/solid-query"

export type UseSessionOptions<TAuthClient extends AuthClient> = Omit<
  SessionOptions<TAuthClient>,
  "initialData"
> &
  SessionParams<TAuthClient> & {
    enabled?: boolean
  }

export function useSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseSessionOptions<TAuthClient> = {}
) {
  const { query, fetchOptions, ...queryOptions } = options
  const { initialData: _initialData, ...baseOptions } = sessionOptions(
    authClient,
    {
      query,
      fetchOptions
    }
  )

  return useQuery(() => ({
    ...baseOptions,
    ...queryOptions
  }))
}
