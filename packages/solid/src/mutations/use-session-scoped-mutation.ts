import {
  type CreateMutationOptions,
  createMutation,
  type MutationKey
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import { useSession } from "../hooks/queries/use-session"
import type { AuthClient } from "../lib/auth-client"
import {
  type AuthMutationMeta,
  createAuthMutationOptions,
  type MutationMethod
} from "./create-auth-mutation"

export type SessionScopedMutationOptions<TMethod extends MutationMethod> = Omit<
  CreateMutationOptions<
    Awaited<ReturnType<TMethod>>,
    BetterFetchError,
    Parameters<TMethod>[0]
  >,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Create a mutation whose `meta` is derived from the current session's userId.
 *
 * This mirrors `useOrganizationMutation` for non-org domains: it reads the
 * session reactively and passes the userId to a meta factory function so that
 * `MutationInvalidator` can invalidate the correct scoped query keys.
 *
 * NOTE: `options` must NEVER contain a `meta` property — the type Omit
 * enforces this at the type level, and the explicit `meta:` assignment below
 * will silently override anything passed via options.
 */
export function useSessionScopedMutation<
  TAuthClient extends AuthClient,
  TMethod extends MutationMethod,
  const TMutationKey extends MutationKey
>(
  authClient: TAuthClient,
  authFn: TMethod,
  mutationKey: TMutationKey,
  meta: (userId: string | undefined) => AuthMutationMeta,
  options?: SessionScopedMutationOptions<TMethod>
) {
  const session = useSession(authClient)

  return createMutation(() => {
    const userId = (session.data as { user?: { id?: string } } | undefined)
      ?.user?.id

    if (!userId) {
      console.debug(
        `[useSessionScopedMutation] userId is undefined for mutation "${String(mutationKey)}". Cache invalidation will be a no-op until the session loads.`
      )
    }

    return {
      ...createAuthMutationOptions(authFn, mutationKey),
      ...options,
      meta: meta(userId)
    }
  })
}
