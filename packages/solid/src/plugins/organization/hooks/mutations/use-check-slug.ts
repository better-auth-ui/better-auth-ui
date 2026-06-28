import {
  type CheckOrganizationSlugOptions,
  checkOrganizationSlugOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseCheckOrganizationSlugOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<CheckOrganizationSlugOptions<TAuthClient>>

export function useCheckOrganizationSlug<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseCheckOrganizationSlugOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...checkOrganizationSlugOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
