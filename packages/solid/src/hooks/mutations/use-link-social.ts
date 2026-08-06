import {
  type AuthClient,
  type LinkSocialOptions,
  linkSocialOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseLinkSocialOptions<TAuthClient extends AuthClient> = Accessor<
  LinkSocialOptions<TAuthClient>
>

export function useLinkSocial<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseLinkSocialOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...linkSocialOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
