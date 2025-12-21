import type { AuthView } from "@better-auth-ui/core"
import type { AnyAuthConfig } from "@better-auth-ui/react"
import { Envelope, Lock } from "@gravity-ui/icons"

import { useAuth } from "../../hooks/use-auth"
import { cn } from "../../lib/utils"

export type MagicLinkButtonProps = AnyAuthConfig & {
  isPending: boolean
  view?: AuthView
}

/**
 * Render a full-width tertiary button that links to either the magic-link or sign-in route and displays the corresponding icon and label.
 *
 * @param isPending - If true, apply disabled styling and prevent interactions
 * @param view - Current auth view; when `"magicLink"`, the button shows the password/sign-in variant
 */
export function MagicLinkButton({
  isPending,
  view,
  ...config
}: MagicLinkButtonProps) {
  const { basePaths, viewPaths, localization, Link } = useAuth(config)

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
