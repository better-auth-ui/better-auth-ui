import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  Card,
  type CardProps,
  cn,
  Description,
  Link,
  useIsHydrated
} from "@heroui/react"
import { useEffect, useState } from "react"

import { magicLinkPlugin } from "../../../lib/auth/magic-link-plugin"
import { OpenEmailButton } from "../open-email-button"

/** `sessionStorage` key the magic-link form stores the submitted email under. */
export const MAGIC_LINK_SENT_STORAGE_KEY = "better-auth-ui.magic-link-sent"

export type MagicLinkSentProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Render a card confirming that a magic-link email was sent, with a button
 * to open the user's email provider.
 *
 * The target email is read from `sessionStorage` (set when the magic-link
 * form redirects here); the OpenEmail button is only shown when an email is
 * stored and resolves to a known provider.
 *
 * @param className - Additional CSS classes applied to the outer card container
 * @param variant - Variant to apply to the card
 * @returns The magic-link-sent card React element
 */
export function MagicLinkSent({ className, variant }: MagicLinkSentProps) {
  const { basePaths, emailAndPassword, localization, viewPaths } = useAuth()
  const { localization: magicLinkLocalization } = useAuthPlugin(magicLinkPlugin)

  const isHydrated = useIsHydrated()
  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem(MAGIC_LINK_SENT_STORAGE_KEY)) || ""
  )

  useEffect(() => {
    setEmail(sessionStorage.getItem(MAGIC_LINK_SENT_STORAGE_KEY) ?? "")
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
            ? magicLinkLocalization.magicLinkSentTo.replace("{{email}}", email)
            : magicLinkLocalization.magicLinkSent}
        </Description>

        {email && <OpenEmailButton email={email} />}
      </Card.Content>

      {emailAndPassword?.enabled && (
        <Card.Footer className="flex-col gap-3">
          <Description className="text-sm">
            {localization.auth.needToCreateAnAccount}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              className="text-accent no-underline hover:underline decoration-accent-hover"
            >
              {localization.auth.signUp}
            </Link>
          </Description>
        </Card.Footer>
      )}
    </Card>
  )
}
