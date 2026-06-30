import {
  type CheckSlugOptions,
  checkSlugOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseCheckSlugOptions<TAuthClient extends OrganizationAuthClient> =
  Accessor<CheckSlugOptions<TAuthClient>>

export function useCheckSlug<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseCheckSlugOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...checkSlugOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
