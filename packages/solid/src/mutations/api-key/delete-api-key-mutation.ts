import {
  apiKeyMutationKeys,
  apiKeyQueryKeys
} from "@better-auth-ui/core/plugins/api-key"
import type { ApiKeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"
import { useSessionScopedMutation } from "../use-session-scoped-mutation"

export type DeleteApiKeyParams<TAuthClient extends ApiKeyAuthClient> =
  Parameters<TAuthClient["apiKey"]["delete"]>[0]

export type DeleteApiKeyOptions = Parameters<
  typeof useSessionScopedMutation<
    ApiKeyAuthClient,
    ApiKeyAuthClient["apiKey"]["delete"],
    typeof apiKeyMutationKeys.delete
  >
>[4]

export function deleteApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.apiKey.delete,
    apiKeyMutationKeys.delete
  )
}

export function useDeleteApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: DeleteApiKeyOptions
) {
  return useSessionScopedMutation(
    authClient,
    authClient.apiKey.delete,
    apiKeyMutationKeys.delete,
    (userId) => ({ awaits: [apiKeyQueryKeys.lists(userId)] }),
    options
  )
}
