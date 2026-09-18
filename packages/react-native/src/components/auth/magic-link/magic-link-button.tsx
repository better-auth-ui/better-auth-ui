import { type AuthView, authMutationKeys } from "@better-auth-ui/core"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"

import { magicLinkPlugin } from "../../../lib/auth/magic-link-plugin"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
import { Envelope, Lock } from "../../../primitives/ui-icons"

export type MagicLinkButtonProps = {
  /** @remarks `AuthView` */
  view?: AuthView
}

/**
 * Toggle button between the password sign-in and magic-link routes. Mirrors
 * the heroui `MagicLinkButton`, adapted for React Native: heroui renders a
 * button-styled `Link` (an anchor styled via `buttonVariants`); RN's `Link`
 * primitive is text-only, so this uses `Button` with an `onPress` that calls
 * the navigation adapter directly.
 *
 * @param view - Current auth view. On `"magicLink"` this switches back to
 * password sign-in.
 */
export function MagicLinkButton({ view }: MagicLinkButtonProps) {
  const { emailAndPassword, localization } = useAuth()
  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const { localization: magicLinkLocalization } = useAuthPlugin(magicLinkPlugin)

  const navigation = useAuthNavigation()

  const isMagicLinkView = view === "magicLink"

  // On the magic-link view this button switches back to password sign-in.
  // With password auth disabled there's nowhere to switch to, so hide it.
  // (Other views — e.g. a phone-number plugin's surface — still get a
  // "Continue with Magic Link" button.)
  if (isMagicLinkView && !emailAndPassword?.enabled) return null

  return (
    <Button
      variant="tertiary"
      className="w-full gap-2"
      isDisabled={isPending}
      onPress={() => navigation.push(isMagicLinkView ? "signIn" : "magicLink")}
    >
      {isMagicLinkView ? <Lock /> : <Envelope />}

      {localization.auth.continueWith.replace(
        "{{provider}}",
        isMagicLinkView
          ? localization.auth.password
          : magicLinkLocalization.magicLink
      )}
    </Button>
  )
}
