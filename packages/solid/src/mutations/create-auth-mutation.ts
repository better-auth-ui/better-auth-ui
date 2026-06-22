import {
  type MutationKey,
  type MutationOptions,
  mutationOptions,
  type QueryKey,
  type UseMutationResult,
  useMutation
} from "@tanstack/solid-query"
import type { BetterFetchError, BetterFetchOption } from "better-auth/client"

// biome-ignore lint/suspicious/noExplicitAny: Better Auth client methods have intentionally variable generated params.
export type MutationMethod<TData = unknown> = (params?: any) => Promise<TData>

export type MutationParams<TMethod extends MutationMethod> =
  Parameters<TMethod>[0]
export type MutationData<TMethod extends MutationMethod> = Awaited<
  ReturnType<TMethod>
>

export type AuthMutationMeta = {
  invalidates?: Array<QueryKey>
  awaits?: Array<QueryKey>
}

export function useAuthMutationResult<TData, TVariables, TContext = unknown>(
  options: () => MutationOptions<TData, BetterFetchError, TVariables, TContext>
): UseMutationResult<TData, BetterFetchError, TVariables, TContext> {
  return useMutation(options) as UseMutationResult<
    TData,
    BetterFetchError,
    TVariables,
    TContext
  >
}

/** @deprecated Use `useAuthMutationResult` instead. */
export const createAuthMutation = useAuthMutationResult

export function createAuthMutationOptions<
  TMethod extends MutationMethod,
  const TMutationKey extends MutationKey
>(authFn: TMethod, mutationKey: TMutationKey, meta?: AuthMutationMeta) {
  const mutationFn = (params: MutationParams<TMethod>) => {
    const input = (params ?? {}) as { fetchOptions?: BetterFetchOption }

    return authFn({
      ...input,
      fetchOptions: { ...input.fetchOptions, throw: true }
    } as MutationParams<TMethod>) as Promise<MutationData<TMethod>>
  }

  return mutationOptions<
    MutationData<TMethod>,
    BetterFetchError,
    MutationParams<TMethod>
  >({
    mutationKey,
    mutationFn,
    ...(meta ? { meta } : {})
  })
}
