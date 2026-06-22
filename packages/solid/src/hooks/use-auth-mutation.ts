import {
  type CreateMutationOptions,
  type MutationKey,
  useMutation
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import {
  type AuthMutationFn,
  type AuthMutationFnData,
  type AuthMutationFnVariables,
  authMutationOptions
} from "../mutations/auth-mutation-options"

type UseAuthMutationOptions<TFn extends AuthMutationFn> = Omit<
  CreateMutationOptions<
    AuthMutationFnData<TFn>,
    BetterFetchError,
    AuthMutationFnVariables<TFn>
  >,
  "mutationKey" | "mutationFn"
>

export function useAuthMutation<
  TFn extends AuthMutationFn,
  const TMutationKey extends MutationKey
>(
  authFn: TFn,
  mutationKey: TMutationKey,
  options?: UseAuthMutationOptions<TFn>
) {
  return useMutation(() => ({
    ...authMutationOptions(authFn, mutationKey),
    ...options
  }))
}
