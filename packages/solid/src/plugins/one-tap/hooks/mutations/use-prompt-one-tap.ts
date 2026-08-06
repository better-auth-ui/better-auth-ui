import {
  type OneTapAuthClient,
  promptOneTapOptions
} from "@better-auth-ui/core/plugins/one-tap"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

/** Open the Google One Tap prompt through TanStack Query. */
export function usePromptOneTap<TAuthClient extends OneTapAuthClient>(
  authClient: TAuthClient,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(() => promptOneTapOptions(authClient), queryClient)
}
