import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { ApiKeyAuthClient } from "./api-key-auth-client"
import { apiKeyMutationKeys } from "./api-key-mutation-keys"
import { apiKeyQueryKeys } from "./api-key-query-keys"

export type DeleteApiKeyParams<TAuthClient extends ApiKeyAuthClient> =
  Parameters<TAuthClient["apiKey"]["delete"]>[0]

export type DeleteApiKeyOptions<TAuthClient extends ApiKeyAuthClient> = Omit<
  ReturnType<typeof deleteApiKeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for deleting an API key.
 *
 * @param authClient - The Better Auth API key client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 */
export function deleteApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  const mutationKey = apiKeyMutationKeys.delete

  const mutationFn = (params: DeleteApiKeyParams<TAuthClient>) =>
    authClient.apiKey.delete({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [apiKeyQueryKeys.lists(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
