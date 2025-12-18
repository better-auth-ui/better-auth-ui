"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import type { AuthView } from "@better-auth-ui/react/core"
import { Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/auth/use-auth"

export type MagicLinkButtonProps = AnyAuthConfig & {
  isPending: boolean
  view?: AuthView
}

/**
 * Render an auth action button that links to either the magic-link or sign-in route and shows the matching icon and label.
 *
 * @param isPending - When true, disables the button to prevent interactions
 * @param view - Current auth view; when `"magicLink"`, the button shows the password/sign-in variant
 * @returns The button element that navigates to the selected auth route
 */
export function MagicLinkButton({
  isPending,
  view,
  ...config
}: MagicLinkButtonProps) {
  const { basePaths, viewPaths, localization, Link } = useAuth(config)

  const isMagicLinkView = view === "magicLink"

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={isPending}
      asChild
    >
      <Link
        href={`${basePaths.auth}/${isMagicLinkView ? viewPaths.auth.signIn : viewPaths.auth.magicLink}`}
      >
        {isMagicLinkView ? <Lock /> : <Mail />}

        {localization.auth.continueWith.replace(
          "{{provider}}",
          isMagicLinkView
            ? localization.auth.password
            : localization.auth.magicLink
        )}
      </Link>
    </Button>
  )
}
