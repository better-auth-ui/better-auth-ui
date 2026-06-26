import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { ApiKeyAuthClientContract } from "./api-key-auth-client"
import { apiKeyMutationKeys } from "./api-key-mutation-keys"
import { apiKeyQueryKeys } from "./api-key-query-keys"

export type CreateApiKeyParams<TAuthClient extends ApiKeyAuthClientContract> =
  Parameters<TAuthClient["apiKey"]["create"]>[0]

export type CreateApiKeyOptions<TAuthClient extends ApiKeyAuthClientContract> =
  Omit<
    ReturnType<typeof createApiKeyOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for creating an API key.
 *
 * @param authClient - The Better Auth API key client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 */
export function createApiKeyOptions<
  TAuthClient extends ApiKeyAuthClientContract
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = apiKeyMutationKeys.create

  const mutationFn = (params: CreateApiKeyParams<TAuthClient>) =>
    authClient.apiKey.create({
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
