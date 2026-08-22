import {
  type RequestSsoDomainVerificationOptions,
  requestSsoDomainVerificationOptions,
  type SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseRequestSsoDomainVerificationOptions<
  TAuthClient extends SsoAuthClient
> = Accessor<RequestSsoDomainVerificationOptions<TAuthClient>>

/** Create a mutation for issuing a fresh SSO domain-verification token. */
export function useRequestSsoDomainVerification<
  TAuthClient extends SsoAuthClient
>(
  authClient: TAuthClient,
  options?: UseRequestSsoDomainVerificationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...requestSsoDomainVerificationOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
