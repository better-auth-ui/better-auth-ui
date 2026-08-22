import {
  type SsoAuthClient,
  type VerifySsoDomainOptions,
  verifySsoDomainOptions
} from "@better-auth-ui/core/plugins/sso"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/** Create a mutation for validating an SSO provider's DNS records. */
export function useVerifySsoDomain<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  options?: VerifySsoDomainOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  return useMutation(
    {
      ...verifySsoDomainOptions(authClient, session?.user.id),
      ...options
    },
    queryClient
  )
}
