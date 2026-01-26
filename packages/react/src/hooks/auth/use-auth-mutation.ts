import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

// biome-ignore lint/suspicious/noExplicitAny: any
type AuthFn = (...args: any) => Promise<any>

type MutationParams<TFn extends AuthFn> = undefined extends Parameters<TFn>[0]
  ? // biome-ignore lint/suspicious/noConfusingVoidType: void is needed for mutations with optional params
    void | Omit<NonNullable<Parameters<TFn>[0]>, "fetchOptions">
  : Omit<Parameters<TFn>[0], "fetchOptions">

export type UseAuthMutationOptions<TFn extends AuthFn> = UseMutationOptions<
  { status: boolean },
  BetterFetchError,
  MutationParams<TFn>
>

export type UseAuthMutationResult<TFn extends AuthFn> = UseMutationResult<
  Awaited<ReturnType<TFn>>,
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
): UseAuthMutationResult<TFn> {
  return useMutation({
    mutationFn: (params) =>
      fn({
        ...params,
        fetchOptions: { throw: true }
      }),
    ...options
  })
}
