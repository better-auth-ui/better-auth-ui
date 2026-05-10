import { type MutationKey, mutationOptions } from "@tanstack/solid-query"
import type { BetterFetchError, BetterFetchOption } from "better-auth/client"

// biome-ignore lint/suspicious/noExplicitAny: Better Auth client methods have intentionally variable generated params.
export type MutationMethod<TData = unknown> = (params?: any) => Promise<TData>

export type MutationParams<TMethod extends MutationMethod> =
  Parameters<TMethod>[0]
export type MutationData<TMethod extends MutationMethod> = Awaited<
  ReturnType<TMethod>
>

export function createAuthMutationOptions<
  TMethod extends MutationMethod,
  const TMutationKey extends MutationKey
>(authFn: TMethod, mutationKey: TMutationKey) {
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
    mutationFn
  })
}
