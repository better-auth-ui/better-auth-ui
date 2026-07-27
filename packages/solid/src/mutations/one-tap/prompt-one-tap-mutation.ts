import { oneTapMutationKeys } from "@better-auth-ui/core/plugins"
import type { OneTapAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

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
  return createAuthMutationOptions(authClient.oneTap, oneTapMutationKeys.prompt)
}
