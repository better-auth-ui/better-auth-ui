import {
  apiKeyMutationKeys,
  apiKeyQueryKeys
} from "@better-auth-ui/core/plugins/api-key"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { ApiKeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type DeleteApiKeyParams<TAuthClient extends ApiKeyAuthClient> =
  Parameters<TAuthClient["apiKey"]["delete"]>[0]

export type DeleteApiKeyOptions = Omit<
  ReturnType<typeof deleteApiKeyOptions<ApiKeyAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function deleteApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  return createAuthMutationOptions(
    authClient.apiKey.delete,
    apiKeyMutationKeys.delete,
    { awaits: [apiKeyQueryKeys.lists(userId)] }
  )
}

export function useDeleteApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: DeleteApiKeyOptions
) {
  const session = useSession(authClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...deleteApiKeyOptions(authClient, userId),
      ...options
    }
  })
}
