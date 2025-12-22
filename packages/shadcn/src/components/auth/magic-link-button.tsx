"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import type { AuthView } from "@better-auth-ui/react/core"
import { Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"

export type MagicLinkButtonProps = AnyAuthConfig & {
  isPending: boolean
  view?: AuthView
}

/**
 * A button that links to either the magic-link or sign-in route and displays the corresponding icon and label.
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
