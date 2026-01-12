import type { AuthView } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { Envelope, Lock } from "@gravity-ui/icons"

import { cn } from "../../lib/utils"

export type MagicLinkButtonProps = {
  isPending: boolean
  view?: AuthView
}

/**
 * Renders a full-width tertiary link-style button that navigates to either the magic-link or sign-in route.
 *
 * @param isPending - If true, applies disabled styling and prevents interaction
 * @param view - Current auth view; when `"magicLink"`, the button targets the sign-in/password variant
 * @returns The rendered Link element with the appropriate href, icon, and label
 */
export function MagicLinkButton({ isPending, view }: MagicLinkButtonProps) {
  const { basePaths, viewPaths, localization, Link } = useAuth()

  const isMagicLinkView = view === "magicLink"

  return (
    <Link
      href={`${basePaths.auth}/${isMagicLinkView ? viewPaths.auth.signIn : viewPaths.auth.magicLink}`}
      className={cn(
        "button button--md button--tertiary w-full focus:ring-accent focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface",
        isPending && "status-disabled pointer-events-none"
      )}
    >
      {isMagicLinkView ? <Lock /> : <Envelope />}

      {localization.auth.continueWith.replace(
        "{{provider}}",
        isMagicLinkView
          ? localization.auth.password
          : localization.auth.magicLink
      )}
    </Link>
  )
}