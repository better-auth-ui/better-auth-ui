import {
  type OrganizationAuthClient,
  type RemoveMemberOptions,
  removeMemberOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseRemoveMemberOptions<TAuthClient extends OrganizationAuthClient> =
  Accessor<RemoveMemberOptions<TAuthClient>>

export function useRemoveMember<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseRemoveMemberOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...removeMemberOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
