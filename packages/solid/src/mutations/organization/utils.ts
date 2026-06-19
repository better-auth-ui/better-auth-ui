import {
  type CreateMutationOptions,
  createMutation,
  type MutationKey
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import { useSession } from "../../hooks/queries/use-session"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import {
  createAuthMutationOptions,
  type MutationMethod
} from "../create-auth-mutation"
import type { AuthMutationMeta } from "./metadata"

export type OrganizationMutationOptions<TMethod extends MutationMethod> = Omit<
  CreateMutationOptions<
    Awaited<ReturnType<TMethod>>,
    BetterFetchError,
    Parameters<TMethod>[0]
  >,
  "mutationKey" | "mutationFn" | "meta"
>

export function createOrganizationMutationOptions<
  TMethod extends MutationMethod,
  const TMutationKey extends MutationKey
>(authFn: TMethod, mutationKey: TMutationKey) {
  return createAuthMutationOptions(authFn, mutationKey)
}

export function useOrganizationMutation<
  TAuthClient extends OrganizationAuthClient,
  TMethod extends MutationMethod,
  const TMutationKey extends MutationKey
>(
  authClient: TAuthClient,
  authFn: TMethod,
  mutationKey: TMutationKey,
  meta: (userId: string | undefined) => AuthMutationMeta,
  options?: OrganizationMutationOptions<TMethod>
) {
  const session = useSession(authClient)

  return createMutation(() => ({
    ...createOrganizationMutationOptions(authFn, mutationKey),
    ...options,
    meta: meta(
      (session.data as { user?: { id?: string } } | undefined)?.user?.id
    )
  }))
}
