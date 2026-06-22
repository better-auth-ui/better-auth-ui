import {
  type AuthMutationFn,
  type AuthMutationFnData,
  type AuthMutationFnVariables,
  authMutationOptions as coreAuthMutationOptions
} from "@better-auth-ui/core"
import {
  type MutationKey,
  mutationOptions,
  type UseMutationOptions
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

export type { AuthMutationFn, AuthMutationFnData, AuthMutationFnVariables }

/**
 * Return type of {@link authMutationOptions}, matching the shape produced by
 * TanStack Query's own `mutationOptions` helper.
 */
export type AuthMutationOptions<
  TFn extends AuthMutationFn,
  TMutationKey extends MutationKey = MutationKey
> = Omit<
  UseMutationOptions<
    AuthMutationFnData<TFn>,
    BetterFetchError,
    AuthMutationFnVariables<TFn>
  >,
  "mutationKey"
> & {
  mutationKey: TMutationKey
}

/**
 * React adapter for core Better Auth mutation options.
 */
export function authMutationOptions<
  TFn extends AuthMutationFn,
  const TMutationKey extends MutationKey
>(
  authFn: TFn,
  mutationKey: TMutationKey
): AuthMutationOptions<TFn, TMutationKey> {
  return mutationOptions(
    coreAuthMutationOptions(authFn, mutationKey)
  ) as AuthMutationOptions<TFn, TMutationKey>
}
