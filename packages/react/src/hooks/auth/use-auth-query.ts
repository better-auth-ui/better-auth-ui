import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError, BetterFetchOption } from "better-auth/react"

type BetterFetchFn = (options: {
  fetchOptions?: BetterFetchOption
}) => Promise<{ data: unknown }>

type InferData<TFn> = TFn extends (options: {
  fetchOptions?: BetterFetchOption
}) => Promise<{ data: infer TData }>
  ? TData
  : never

type OmitFetchOptions<T> = {
  [K in keyof T as K extends "fetchOptions" ? never : K]: T[K]
}

export type UseAuthQueryOptions<TFn extends BetterFetchFn> = Omit<
  UseQueryOptions<InferData<TFn>, BetterFetchError>,
  "queryFn"
>

export type UseAuthQueryResult<TFn extends BetterFetchFn> = UseQueryResult<
  InferData<TFn>,
  BetterFetchError
>

type UseAuthQueryProps<TFn extends BetterFetchFn> = {
  authFn: TFn
  params?: OmitFetchOptions<Parameters<TFn>[0]>
  options: UseAuthQueryOptions<TFn>
}

export function useAuthQuery<TFn extends BetterFetchFn>({
  authFn,
  params,
  options
}: UseAuthQueryProps<TFn>) {
  return useQuery<InferData<TFn>, BetterFetchError>({
    queryFn: async () => {
      const result = await authFn({ ...params, fetchOptions: { throw: true } })
      return result as InferData<TFn>
    },
    ...options
  })
}
