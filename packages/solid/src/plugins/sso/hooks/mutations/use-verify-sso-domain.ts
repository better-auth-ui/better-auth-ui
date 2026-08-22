import {
  type SsoAuthClient,
  type VerifySsoDomainOptions,
  verifySsoDomainOptions
} from "@better-auth-ui/core/plugins/sso"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseVerifySsoDomainOptions<TAuthClient extends SsoAuthClient> =
  Accessor<VerifySsoDomainOptions<TAuthClient>>

/** Create a mutation for validating an SSO provider's DNS records. */
export function useVerifySsoDomain<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  options?: UseVerifySsoDomainOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...verifySsoDomainOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
