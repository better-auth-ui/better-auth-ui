import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

// biome-ignore lint/suspicious/noExplicitAny: any
export type UseAuthMutationOptions<TFn extends (...args: any) => Promise<any>> =
  UseMutationOptions<{ status: boolean }, BetterFetchError, Parameters<TFn>[0]>

// biome-ignore lint/suspicious/noExplicitAny: any
export function useAuthMutation<TFn extends (...args: any) => Promise<any>>(
  fn: TFn,
  options?: UseMutationOptions<
    Awaited<ReturnType<TFn>>,
    BetterFetchError,
    Omit<Parameters<TFn>[0], "fetchOptions">
  >
): UseMutationResult<
  Awaited<ReturnType<TFn>>,
  BetterFetchError,
  Omit<Parameters<TFn>[0], "fetchOptions">
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
