import {
  type ApiKeyAuthClient,
  type CreateApiKeyOptions,
  createApiKeyOptions
} from "@better-auth-ui/core/plugins/api-key"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseCreateApiKeyOptions<TAuthClient extends ApiKeyAuthClient> =
  Accessor<CreateApiKeyOptions<TAuthClient>>

export function useCreateApiKey<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options?: UseCreateApiKeyOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...createApiKeyOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
