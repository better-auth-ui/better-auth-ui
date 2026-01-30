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

export type UseAuthMutationOptions<TFn extends AuthFn> = Omit<
  UseMutationOptions<
    Awaited<ReturnType<TFn>>,
    BetterFetchError,
    MutationParams<TFn>
  >,
  "mutationFn"
>

export type UseAuthMutationResult<TFn extends AuthFn> = UseMutationResult<
  Awaited<ReturnType<TFn>>,
  BetterFetchError,
  MutationParams<TFn>
>

type UseAuthMutationProps<TFn extends AuthFn> = {
  authFn: TFn
  options?: UseAuthMutationOptions<TFn>
}

export function useAuthMutation<TFn extends AuthFn>({
  authFn,
  options
}: UseAuthMutationProps<TFn>): UseAuthMutationResult<TFn> {
  return useMutation({
    mutationFn: (params) =>
      authFn({
        ...params,
        fetchOptions: { throw: true }
      }),
    ...options
  })
}
