import {
  type OneTapAuthClient,
  promptOneTapOptions,
  type PromptOneTapParams
} from "@better-auth-ui/core/plugins/one-tap"
import {
  type QueryClient,
  useMutation,
  type UseMutationResult
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import type { Accessor } from "solid-js"

/** Open the Google One Tap prompt through TanStack Query. */
export function usePromptOneTap<TAuthClient extends OneTapAuthClient>(
  authClient: TAuthClient,
  queryClient?: Accessor<QueryClient>
): UseMutationResult<void, BetterFetchError, PromptOneTapParams<TAuthClient>> {
  return useMutation(() => promptOneTapOptions(authClient), queryClient)
}
