import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authMutationOptions } from "../../lib/auth-mutation-options"
import type { ApiKeyAuthClient } from "./api-key-auth-client"
import { apiKeyMutationKeys } from "./api-key-mutation-keys"
import { apiKeyQueryKeys } from "./api-key-query-keys"

export type CreateApiKeyParams<TAuthClient extends ApiKeyAuthClient> =
  Parameters<TAuthClient["apiKey"]["create"]>[0]

export type CreateApiKeyOptions<TAuthClient extends ApiKeyAuthClient> = Omit<
  ReturnType<typeof createApiKeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for creating an API key.
 *
 * @param authClient - The Better Auth API key client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 */
export function createApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  return {
    ...authMutationOptions(authClient.apiKey.create, apiKeyMutationKeys.create),
    meta: {
      awaits: [apiKeyQueryKeys.lists(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<TAuthClient["apiKey"]["create"]>>,
    BetterFetchError,
    CreateApiKeyParams<TAuthClient>
  >
}
