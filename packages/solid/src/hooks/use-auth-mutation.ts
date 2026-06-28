import {
  type AuthMutationFn,
  type AuthMutationFnData,
  type AuthMutationFnVariables,
  authMutationOptions
} from "@better-auth-ui/core"
import {
  type CreateMutationOptions,
  type MutationKey,
  type QueryClient,
  useMutation
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import type { Accessor } from "solid-js"

type UseAuthMutationOptions<TFn extends AuthMutationFn> = Accessor<
  Omit<
    CreateMutationOptions<
      AuthMutationFnData<TFn>,
      BetterFetchError,
      AuthMutationFnVariables<TFn>
    >,
    "mutationKey" | "mutationFn"
  >
>

export function useAuthMutation<
  TFn extends AuthMutationFn,
  const TMutationKey extends MutationKey
>(
  authFn: TFn,
  mutationKey: TMutationKey,
  options?: UseAuthMutationOptions<TFn>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...authMutationOptions(authFn, mutationKey),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
