import { getAuthLinkURL } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import {
  Card,
  type CardProps,
  cn,
  Description,
  Link,
  useIsHydrated
} from "@heroui/react"
import { useEffect, useState } from "react"

import { OpenEmailButton } from "./open-email-button"

/** `sessionStorage` key the forgot-password form stores the submitted email under. */
export const RESET_LINK_SENT_STORAGE_KEY = "better-auth-ui.reset-link-sent"

export type ResetLinkSentProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Render a card confirming that a password-reset email was sent, with a
 * button to open the user's email provider.
 *
 * The target email is read from `sessionStorage` (set when the forgot-password
 * form redirects here); the OpenEmail button is only shown when an email is
 * stored and resolves to a known provider.
 *
 * @param className - Additional CSS classes applied to the outer card container
 * @param variant - Variant to apply to the card
 * @returns The reset-link-sent card React element
 */
export function ResetLinkSent({ className, variant }: ResetLinkSentProps) {
  const { basePaths, localization, redirectTo, viewPaths } = useAuth()

  const isHydrated = useIsHydrated()
  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem(RESET_LINK_SENT_STORAGE_KEY)) || ""
  )

  useEffect(() => {
    setEmail(sessionStorage.getItem(RESET_LINK_SENT_STORAGE_KEY) ?? "")
  }, [])

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.checkYourEmailTitle}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        <Description className="text-sm">
          {email
            ? localization.auth.resetLinkSentTo.replace("{{email}}", email)
            : localization.auth.passwordResetEmailSent}
        </Description>

        {email && <OpenEmailButton email={email} />}
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            href={getAuthLinkURL(
              `${basePaths.auth}/${viewPaths.auth.signIn}`,
              redirectTo
            )}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
