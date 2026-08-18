import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { ApiKeyAuthClient } from "./api-key-auth-client"
import { apiKeyMutationKeys } from "./api-key-mutation-keys"
import { apiKeyQueryKeys } from "./api-key-query-keys"

export type UpdateApiKeyParams<TAuthClient extends ApiKeyAuthClient> =
  Parameters<TAuthClient["apiKey"]["update"]>[0]

export type UpdateApiKeyOptions<TAuthClient extends ApiKeyAuthClient> = Omit<
  ReturnType<typeof updateApiKeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/** Mutation options factory for updating an API key. */
export function updateApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  const mutationFn = (params: UpdateApiKeyParams<TAuthClient>) =>
    authClient.apiKey.update({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: apiKeyMutationKeys.update,
    mutationFn,
    meta: { awaits: [apiKeyQueryKeys.lists(userId)] }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
