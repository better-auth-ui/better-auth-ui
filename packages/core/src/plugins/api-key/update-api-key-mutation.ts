import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { ApiKeyAuthClient } from "./api-key-auth-client"
import { apiKeyMutationKeys } from "./api-key-mutation-keys"
import { apiKeyQueryKeys } from "./api-key-query-keys"

type UpdateApiKeyInput = NonNullable<
  Parameters<ApiKeyAuthClient["apiKey"]["update"]>[0]
>

type UpdateApiKeyClientField = "configId" | "keyId" | "name" | "fetchOptions"

/** Fields accepted by Better Auth's client-side API key update endpoint. */
export type UpdateApiKeyParams = Pick<
  UpdateApiKeyInput,
  UpdateApiKeyClientField
>

export type UpdateApiKeyOptions<TAuthClient extends ApiKeyAuthClient> = Omit<
  ReturnType<typeof updateApiKeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/** Mutation options factory for updating an API key. */
export function updateApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  const mutationFn = (params: UpdateApiKeyParams) => {
    const { configId, keyId, name, fetchOptions } = params

    return authClient.apiKey.update({
      keyId,
      ...(configId !== undefined ? { configId } : {}),
      ...(name !== undefined ? { name } : {}),
      fetchOptions: { ...fetchOptions, throw: true }
    })
  }

  return {
    mutationKey: apiKeyMutationKeys.update,
    mutationFn,
    meta: { awaits: [apiKeyQueryKeys.all(userId)] }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
