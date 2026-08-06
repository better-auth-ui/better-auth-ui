import type {
  MutationKey,
  MutationOptions,
  UseMutationOptions
} from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import type { BetterFetchError, BetterFetchOption } from "better-auth/client"

// Function parameters are contravariant under `strictFunctionTypes`, so a
// concrete endpoint such as `(variables: { email: string }) => Promise<...>` is
// NOT assignable to `(variables: unknown) => ...`. `any` is the variance bridge
// that keeps every Better Auth client method assignable while `TFn` still
// infers the real parameter type for `AuthMutationFnVariables`.
// biome-ignore lint/suspicious/noExplicitAny: variance bridge, see above
type AuthMutationFn = (variables: any) => Promise<unknown>

type AuthMutationFnData<TFn extends AuthMutationFn> = Awaited<ReturnType<TFn>>

type AuthMutationFnVariables<TFn extends AuthMutationFn> =
  Parameters<TFn>[0] extends infer P
    ? undefined extends P
      ? // biome-ignore lint/suspicious/noConfusingVoidType: preserve no-arg mutate ergonomics
        NonNullable<P> | void
      : P
    : never

type UseAuthMutationOptions<TFn extends AuthMutationFn> = Omit<
  UseMutationOptions<
    AuthMutationFnData<TFn>,
    BetterFetchError,
    AuthMutationFnVariables<TFn>
  >,
  "mutationKey" | "mutationFn"
>
const createAuthMutationOptions = <
  TFn extends AuthMutationFn,
  const TMutationKey extends MutationKey
>(
  authFn: TFn,
  mutationKey: TMutationKey
): MutationOptions<
  AuthMutationFnData<TFn>,
  BetterFetchError,
  AuthMutationFnVariables<TFn>,
  unknown
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
  } as MutationOptions<
    AuthMutationFnData<TFn>,
    BetterFetchError,
    AuthMutationFnVariables<TFn>,
    unknown
  >
}

/**
 * Escape-hatch hook for Better Auth write endpoints that don't have a
 * purpose-built mutation hook in this library yet.
 *
 * @param authFn - Better Auth client method (e.g. `authClient.emailOtp.sendVerificationOtp`).
 * @param mutationKey - Stable key for the mutation. Prefer an entry from
 *   `authMutationKeys` over an inline tuple so `useIsMutating` and global
 *   `MutationCache` observers line up.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useAuthMutation<
  TFn extends AuthMutationFn,
  const TMutationKey extends MutationKey
>(
  authFn: TFn,
  mutationKey: TMutationKey,
  options?: UseAuthMutationOptions<TFn>
) {
  return useMutation({
    ...createAuthMutationOptions(authFn, mutationKey),
    ...options
  })
}
