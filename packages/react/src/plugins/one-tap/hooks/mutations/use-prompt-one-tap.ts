import {
  type OneTapAuthClient,
  promptOneTapOptions
} from "@better-auth-ui/core/plugins/one-tap"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/** Open the Google One Tap prompt through TanStack Query. */
export function usePromptOneTap<TAuthClient extends OneTapAuthClient>(
  authClient: TAuthClient,
  queryClient?: QueryClient
) {
  return useMutation(promptOneTapOptions(authClient), queryClient)
}
