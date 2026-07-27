import { oneTapMutationKeys } from "@better-auth-ui/core/plugins"
import { type QueryClient, useMutation } from "@tanstack/react-query"

import type { OneTapAuthClient } from "../../lib/auth-client"
import { authMutationOptions } from "../auth-mutation-options"

export type PromptOneTapParams<TAuthClient extends OneTapAuthClient> =
  NonNullable<Parameters<TAuthClient["oneTap"]>[0]>

/**
 * Build mutation options for opening the Google One Tap prompt.
 *
 * The dedicated mutation key keeps the ambient prompt observable by global
 * error handlers without marking the regular sign-in form as pending.
 */
export function promptOneTapOptions<TAuthClient extends OneTapAuthClient>(
  authClient: TAuthClient
) {
  return authMutationOptions(authClient.oneTap, oneTapMutationKeys.prompt)
}

/** Open the Google One Tap prompt through TanStack Query. */
export function usePromptOneTap<TAuthClient extends OneTapAuthClient>(
  authClient: TAuthClient,
  queryClient?: QueryClient
) {
  return useMutation(promptOneTapOptions(authClient), queryClient)
}
