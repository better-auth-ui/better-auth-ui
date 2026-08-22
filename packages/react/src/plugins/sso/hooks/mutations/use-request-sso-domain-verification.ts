import {
  type RequestSsoDomainVerificationOptions,
  requestSsoDomainVerificationOptions,
  type SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/** Create a mutation for issuing a fresh SSO domain-verification token. */
export function useRequestSsoDomainVerification<
  TAuthClient extends SsoAuthClient
>(
  authClient: TAuthClient,
  options?: RequestSsoDomainVerificationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  return useMutation(
    {
      ...requestSsoDomainVerificationOptions(authClient, session?.user.id),
      ...options
    },
    queryClient
  )
}
