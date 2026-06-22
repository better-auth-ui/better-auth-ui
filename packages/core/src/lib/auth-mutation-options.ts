import type { MutationKey, MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError, BetterFetchOption } from "better-auth/client"

/**
 * Write-style Better Auth client method. Variables are a single object that
 * may carry top-level params plus `fetchOptions`.
 */
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
  MutationOptions<
    AuthMutationFnData<TFn>,
    BetterFetchError,
    AuthMutationFnVariables<TFn>
  >,
  "mutationKey"
> & {
  mutationKey: TMutationKey
}

/**
 * Build framework-neutral mutation options for a Better Auth endpoint.
 *
 * Injects `throw: true` into `fetchOptions` so failures reject with
 * `BetterFetchError` instead of resolving to `{ data, error }`.
 */
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

  return {
    mutationKey,
    mutationFn
  }
}
