/**
 * Mutation keys contributed by the Google One Tap UI plugin.
 *
 * The ambient prompt intentionally lives outside the shared
 * `["auth", "signIn"]` namespace. Google can keep the prompt open or retry it
 * for several seconds, and that background work must not disable the regular
 * sign-in form.
 */
export const oneTapMutationKeys = {
  /** Key for opening the Google One Tap prompt. */
  prompt: ["auth", "oneTap", "prompt"] as const
} as const
