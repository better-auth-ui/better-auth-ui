import {
  type AuthMutationFn,
  type AuthMutationFnData,
  type AuthMutationFnVariables,
  authMutationOptions as coreAuthMutationOptions
} from "@better-auth-ui/core"
import {
  type CreateMutationOptions,
  type MutationKey,
  mutationOptions
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"

export type { AuthMutationFn, AuthMutationFnData, AuthMutationFnVariables }

export type AuthMutationOptions<
  TFn extends AuthMutationFn,
  TMutationKey extends MutationKey = MutationKey
> = Omit<
  CreateMutationOptions<
    AuthMutationFnData<TFn>,
    BetterFetchError,
    AuthMutationFnVariables<TFn>
  >,
  "mutationKey"
> & {
  mutationKey: TMutationKey
}

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
