import {
  apiKeyMutationKeys,
  apiKeyQueryKeys
} from "@better-auth-ui/core/plugins/api-key"
import type { ApiKeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"
import { useSessionScopedMutation } from "../use-session-scoped-mutation"

export type CreateApiKeyParams<TAuthClient extends ApiKeyAuthClient> =
  Parameters<TAuthClient["apiKey"]["create"]>[0]

export type CreateApiKeyOptions = Parameters<
  typeof useSessionScopedMutation<
    ApiKeyAuthClient,
    ApiKeyAuthClient["apiKey"]["create"],
    typeof apiKeyMutationKeys.create
  >
>[4]

export function createApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.apiKey.create,
    apiKeyMutationKeys.create
  )
}

export function useCreateApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: CreateApiKeyOptions
) {
  return useSessionScopedMutation(
    authClient,
    authClient.apiKey.create,
    apiKeyMutationKeys.create,
    (userId) => ({ awaits: [apiKeyQueryKeys.lists(userId)] }),
    options
  )
}
