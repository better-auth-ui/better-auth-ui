import {
  type ApiKeyAuthClient,
  type DeleteApiKeyOptions,
  deleteApiKeyOptions
} from "@better-auth-ui/core/plugins/api-key"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseDeleteApiKeyOptions<TAuthClient extends ApiKeyAuthClient> =
  Accessor<DeleteApiKeyOptions<TAuthClient>>

export function useDeleteApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: UseDeleteApiKeyOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...deleteApiKeyOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
