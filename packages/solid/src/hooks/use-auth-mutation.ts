import {
  type CreateMutationOptions,
  type MutationKey,
  type QueryClient,
  useMutation
} from "@tanstack/solid-query"
import type { BetterFetchError, BetterFetchOption } from "better-auth/client"
import type { Accessor } from "solid-js"

type AuthMutationFn = (variables: unknown) => Promise<unknown>

type AuthMutationFnData<TFn extends AuthMutationFn> = Awaited<ReturnType<TFn>>

type AuthMutationFnVariables<TFn extends AuthMutationFn> =
  Parameters<TFn>[0] extends infer P
    ? undefined extends P
      ? // biome-ignore lint/suspicious/noConfusingVoidType: preserve no-arg mutate ergonomics
        NonNullable<P> | void
      : P
    : never

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

const createAuthMutationOptions = <
  TFn extends AuthMutationFn,
  const TMutationKey extends MutationKey
>(
  authFn: TFn,
  mutationKey: TMutationKey
): CreateMutationOptions<
  AuthMutationFnData<TFn>,
  BetterFetchError,
  AuthMutationFnVariables<TFn>
> => {
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
  } as unknown as CreateMutationOptions<
    AuthMutationFnData<TFn>,
    BetterFetchError,
    AuthMutationFnVariables<TFn>
  >
}

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
      ...createAuthMutationOptions(authFn, mutationKey),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
