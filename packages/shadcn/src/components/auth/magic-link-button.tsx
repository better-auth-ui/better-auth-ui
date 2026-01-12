"use client"

import { useAuth } from "@better-auth-ui/react"
import type { AuthView } from "@better-auth-ui/react/core"
import { Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type MagicLinkButtonProps = {
  isPending: boolean
  view?: AuthView
}

/**
 * Renders a full-width outline button that navigates to either the magic-link flow or the sign-in flow and shows the matching icon and label.
 *
 * @param isPending - If true, disables the button and applies pending styling
 * @param view - Current auth view; when "magicLink", the button targets the sign-in/password route
 * @returns The button element configured to navigate to the appropriate auth route
 */
export function MagicLinkButton({ isPending, view }: MagicLinkButtonProps) {
  const { basePaths, viewPaths, localization, Link } = useAuth()

  const isMagicLinkView = view === "magicLink"

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      className={cn("w-full", isPending && "opacity-50 pointer-events-none")}
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
