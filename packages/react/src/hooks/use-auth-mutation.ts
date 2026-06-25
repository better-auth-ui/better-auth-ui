import {
  type AuthMutationFn,
  type AuthMutationFnData,
  type AuthMutationFnVariables,
  authMutationOptions
} from "@better-auth-ui/core"
import {
  type MutationKey,
  type UseMutationOptions,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

type UseAuthMutationOptions<TFn extends AuthMutationFn> = Omit<
  UseMutationOptions<
    AuthMutationFnData<TFn>,
    BetterFetchError,
    AuthMutationFnVariables<TFn>
  >,
  "mutationKey" | "mutationFn"
>

/**
 * Escape-hatch hook for Better Auth write endpoints that don't have a
 * purpose-built mutation hook in this library yet. Thin wrapper over
 * `useMutation` and `authMutationOptions`.
 *
 * @param authFn - Better Auth client method (e.g. `authClient.emailOtp.sendVerificationOtp`).
 * @param mutationKey - Stable key for the mutation. Prefer an entry from
 *   `authMutationKeys` over an inline tuple so `useIsMutating` and global
 *   `MutationCache` observers line up.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useAuthMutation<
  TFn extends AuthMutationFn,
  const TMutationKey extends MutationKey
>(
  authFn: TFn,
  mutationKey: TMutationKey,
  options?: UseAuthMutationOptions<TFn>
) {
  return useMutation({
    ...authMutationOptions(authFn, mutationKey),
    ...options
  })
}
