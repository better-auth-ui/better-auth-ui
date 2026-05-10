import {
  type CreateMutationOptions,
  type MutationKey,
  mutationOptions
} from "@tanstack/solid-query"
import type { BetterFetchError, BetterFetchOption } from "better-auth/client"

export type AuthMutationFn = (
  // biome-ignore lint/suspicious/noExplicitAny: variance bridge for arbitrary Better Auth client methods
  variables: any
) => Promise<unknown>

export type AuthMutationFnData<TFn extends AuthMutationFn> = Awaited<
  ReturnType<TFn>
>

export type AuthMutationFnVariables<TFn extends AuthMutationFn> =
  Parameters<TFn>[0] extends infer P
    ? undefined extends P
      ? // biome-ignore lint/suspicious/noConfusingVoidType: void allows no-arg mutate
        NonNullable<P> | void
      : P
    : never

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
  const mutationFn = (variables: AuthMutationFnVariables<TFn>) => {
    const vars = (variables ?? {}) as { fetchOptions?: BetterFetchOption }
    return authFn({
      ...vars,
      fetchOptions: { ...vars.fetchOptions, throw: true }
    }) as Promise<AuthMutationFnData<TFn>>
  }

  return mutationOptions<
    AuthMutationFnData<TFn>,
    BetterFetchError,
    AuthMutationFnVariables<TFn>
  >({
    mutationKey,
    mutationFn
  }) as AuthMutationOptions<TFn, TMutationKey>
}
