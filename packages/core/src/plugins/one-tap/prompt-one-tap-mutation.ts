import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OneTapAuthClient } from "./one-tap-auth-client"
import { oneTapMutationKeys } from "./one-tap-mutation-keys"

export type PromptOneTapParams<TAuthClient extends OneTapAuthClient> =
  NonNullable<Parameters<TAuthClient["oneTap"]>[0]>

/** Mutation options factory for opening the Google One Tap prompt. */
export function promptOneTapOptions<TAuthClient extends OneTapAuthClient>(
  authClient: TAuthClient
) {
  const mutationFn = (params: PromptOneTapParams<TAuthClient>) =>
    authClient.oneTap({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: oneTapMutationKeys.prompt,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
