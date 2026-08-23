import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { ApiKeyAuthClient } from "./api-key-auth-client"
import { apiKeyMutationKeys } from "./api-key-mutation-keys"
import { apiKeyQueryKeys } from "./api-key-query-keys"

type CreateApiKeyInput = NonNullable<
  Parameters<ApiKeyAuthClient["apiKey"]["create"]>[0]
>

type CreateApiKeyClientField =
  | "configId"
  | "name"
  | "expiresIn"
  | "organizationId"
  | "prefix"
  | "metadata"
  | "fetchOptions"

/** Fields accepted by Better Auth's client-side API key creation endpoint. */
export type CreateApiKeyParams =
  | Pick<CreateApiKeyInput, CreateApiKeyClientField>
  | undefined

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
  const mutationKey = apiKeyMutationKeys.create

  const mutationFn = (params: CreateApiKeyParams) => {
    const {
      configId,
      name,
      expiresIn,
      organizationId,
      prefix,
      metadata,
      fetchOptions
    } = params ?? {}

    return authClient.apiKey.create({
      ...(configId !== undefined ? { configId } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(expiresIn !== undefined ? { expiresIn } : {}),
      ...(organizationId !== undefined ? { organizationId } : {}),
      ...(prefix !== undefined ? { prefix } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
      fetchOptions: { ...fetchOptions, throw: true }
    })
  }

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
