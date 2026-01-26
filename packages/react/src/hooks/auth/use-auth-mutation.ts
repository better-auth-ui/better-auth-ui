import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

// biome-ignore lint/suspicious/noExplicitAny: any
type AuthFn = (...args: any) => Promise<any>

type MutationParams<TFn extends AuthFn> = keyof Omit<
  Parameters<TFn>[0],
  "fetchOptions"
> extends never
  ? // biome-ignore lint/suspicious/noConfusingVoidType: void is needed for mutations with no params
    void
  : Omit<Parameters<TFn>[0], "fetchOptions">

export type UseAuthMutationOptions<TFn extends AuthFn> = UseMutationOptions<
  { status: boolean },
  BetterFetchError,
  MutationParams<TFn>
>

export function useAuthMutation<TFn extends AuthFn>(
  fn: TFn,
  options?: UseMutationOptions<
    Awaited<ReturnType<TFn>>,
    BetterFetchError,
    MutationParams<TFn>
  >
): UseMutationResult<
  Awaited<ReturnType<TFn>>,
  BetterFetchError,
  MutationParams<TFn>
> {
  return useMutation({
    mutationFn: (params) =>
      fn({
        ...params,
        fetchOptions: { throw: true }
      }),
    ...options
  })
}
