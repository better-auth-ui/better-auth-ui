"use client"

import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldDescription } from "@/components/ui/field"
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"
import { cn } from "@/lib/utils"
import { OpenEmailButton } from "./open-email-button"
import { useIsHydrated } from "./use-is-hydrated"

/** `sessionStorage` key the magic-link form stores the submitted email under. */
export const MAGIC_LINK_SENT_STORAGE_KEY = "better-auth-ui.magic-link-sent"

export type MagicLinkSentProps = {
  className?: string
}

/**
 * Render a card confirming that a magic-link email was sent, with a button
 * to open the user's email provider.
 *
 * The target email is read from `sessionStorage` (set when the magic-link
 * form redirects here); the OpenEmail button is only shown when an email is
 * stored and resolves to a known provider.
 *
 * @param className - Additional CSS classes applied to the card
 * @returns The magic-link-sent card React element
 */
export function MagicLinkSent({ className }: MagicLinkSentProps) {
  const { basePaths, emailAndPassword, localization, viewPaths, Link } =
    useAuth()
  const { localization: magicLinkLocalization } = useAuthPlugin(magicLinkPlugin)

  const isHydrated = useIsHydrated()
  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem(MAGIC_LINK_SENT_STORAGE_KEY)) || ""
  )

  useEffect(() => {
    setEmail(sessionStorage.getItem(MAGIC_LINK_SENT_STORAGE_KEY) ?? "")
  }, [])

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.checkYourEmailTitle}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          <FieldDescription>
            {email
              ? magicLinkLocalization.magicLinkSentTo.replace(
                  "{{email}}",
                  email
                )
              : magicLinkLocalization.magicLinkSent}
          </FieldDescription>

          {email && <OpenEmailButton email={email} />}
        </div>

        {emailAndPassword?.enabled && (
          <div className="flex flex-col gap-3 items-center w-full mt-4">
            <FieldDescription className="text-center">
              {localization.auth.needToCreateAnAccount}{" "}
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signUp}
              </Link>
            </FieldDescription>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
