import {
  apiKeyMutationKeys,
  apiKeyQueryKeys
} from "@better-auth-ui/core/plugins/api-key"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { ApiKeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type CreateApiKeyParams<TAuthClient extends ApiKeyAuthClient> =
  Parameters<TAuthClient["apiKey"]["create"]>[0]

export type CreateApiKeyOptions = Omit<
  ReturnType<typeof createApiKeyOptions<ApiKeyAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function createApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  return createAuthMutationOptions(
    authClient.apiKey.create,
    apiKeyMutationKeys.create,
    { awaits: [apiKeyQueryKeys.lists(userId)] }
  )
}

export function useCreateApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: CreateApiKeyOptions
) {
  const session = useSession(authClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...createApiKeyOptions(authClient, userId),
      ...options
    }
  })
}
