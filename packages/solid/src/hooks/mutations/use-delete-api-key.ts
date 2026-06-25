import {
  type ApiKeyAuthClient,
  type DeleteApiKeyOptions,
  deleteApiKeyOptions
} from "@better-auth-ui/core/plugins/api-key"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../queries/use-session"

export function useDeleteApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: DeleteApiKeyOptions<TAuthClient>
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
