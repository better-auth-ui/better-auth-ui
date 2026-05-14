import { apiKeyMutationKeys } from "@better-auth-ui/core/plugins"
import type { ApiKeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type CreateApiKeyParams<TAuthClient extends ApiKeyAuthClient> =
  Parameters<TAuthClient["apiKey"]["create"]>[0]

export function createApiKeyOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.apiKey.create,
    apiKeyMutationKeys.createApiKey
  )
}
