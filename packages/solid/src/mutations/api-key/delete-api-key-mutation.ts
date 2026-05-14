import { apiKeyMutationKeys } from "@better-auth-ui/core/plugins"
import type { ApiKeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type DeleteApiKeyParams<TAuthClient extends ApiKeyAuthClient> =
  Parameters<TAuthClient["apiKey"]["delete"]>[0]

export function deleteApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.apiKey.delete,
    apiKeyMutationKeys.deleteApiKey
  )
}
