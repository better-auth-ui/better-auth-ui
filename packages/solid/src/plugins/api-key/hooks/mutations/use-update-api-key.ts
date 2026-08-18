import {
  type ApiKeyAuthClient,
  type UpdateApiKeyOptions,
  updateApiKeyOptions
} from "@better-auth-ui/core/plugins/api-key"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseUpdateApiKeyOptions<TAuthClient extends ApiKeyAuthClient> =
  Accessor<UpdateApiKeyOptions<TAuthClient>>

export function useUpdateApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: UseUpdateApiKeyOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...updateApiKeyOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
