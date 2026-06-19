import {
  apiKeyMutationKeys,
  apiKeyQueryKeys
} from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { ApiKeyAuthClient } from "../../lib/auth-client"

export type DeleteApiKeyParams<
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
> = Parameters<TAuthClient["apiKey"]["delete"]>[0]

export type DeleteApiKeyOptions<
  TAuthClient extends ApiKeyAuthClient = ApiKeyAuthClient
> = Omit<
  ReturnType<typeof deleteApiKeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for deleting an API key.
 *
 * @param authClient - The Better Auth client with the API key plugin.
 */
export function deleteApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = apiKeyMutationKeys.delete

  const mutationFn = (params: DeleteApiKeyParams<TAuthClient>) =>
    authClient.apiKey.delete({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({
    mutationKey,
    mutationFn
  })
}

/**
 * Create a mutation for deleting an API key.
 *
 * On success, `MutationInvalidator` awaits invalidation of the user's API key
 * list queries (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the API key plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useDeleteApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: DeleteApiKeyOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...deleteApiKeyOptions(authClient),
      ...options,
      meta: {
        awaits: [apiKeyQueryKeys.lists(userId)]
      }
    },
    queryClient
  )
}
