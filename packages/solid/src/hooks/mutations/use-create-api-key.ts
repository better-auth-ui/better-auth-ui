import {
  type ApiKeyAuthClient,
  type CreateApiKeyOptions,
  createApiKeyOptions
} from "@better-auth-ui/core/plugins/api-key"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../queries/use-session"

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
