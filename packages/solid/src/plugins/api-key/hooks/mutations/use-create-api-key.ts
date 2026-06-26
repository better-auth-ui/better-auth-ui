import {
  type CreateApiKeyOptions,
  createApiKeyOptions
} from "@better-auth-ui/core/plugins/api-key"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../../../../hooks/queries/use-session"
import type { ApiKeyAuthClient } from "../../api-key-auth-client"

export function useCreateApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: CreateApiKeyOptions<TAuthClient>
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
