import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"
import { authQueryKeys } from "../lib/auth-query-keys"

export type RevokeSessionsParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["revokeSessions"]
>[0]

export type RevokeSessionsOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof revokeSessionsOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/** Mutation options factory for revoking all sessions, including the current one. */
export function revokeSessionsOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationFn = (
    // biome-ignore lint/suspicious/noConfusingVoidType: void allows no-arg mutate
    params?: RevokeSessionsParams<TAuthClient> | void
  ) =>
    authClient.revokeSessions({
      ...(params ?? {}),
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: authMutationKeys.revokeSessions,
    mutationFn,
    meta: {
      removes: [authQueryKeys.all]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
