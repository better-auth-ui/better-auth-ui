import { useResendCooldown } from "../../lib/auth/use-resend-cooldown"
import { getAuthCallbackURL, getViewURL } from "@better-auth-ui/core"
import {
  useAuth,
  useAuthPlugin,
  useRequestPasswordReset
} from "@better-auth-ui/react"
import type { MagicLinkAuthClient } from "@better-auth-ui/core/plugins/magic-link"
import { useSignInMagicLink } from "@better-auth-ui/react/plugins/magic-link"
import { getPendingEmail } from "../../lib/pending-email"
import { magicLinkPlugin } from "../../lib/auth/magic-link-plugin"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Button } from "../../primitives/button"
import { Card } from "../../primitives/card"
import { Description } from "../../primitives/description"
import { Link } from "../../primitives/link"
import { toast } from "../../primitives/toast"
import type { AuthViewProps } from "../../lib/auth-plugin"
import { cn } from "../../lib/cn"
import { OpenEmailButton } from "./open-email-button"

function EmailLinkSent({
  email,
  description,
  onResend,
  isPending,
  className,
  variant
}: AuthViewProps & {
  email?: string
  description: string
  onResend: () => void
  isPending: boolean
}) {
  const { localization } = useAuth()
  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown(60)
  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <Card.Header>
        <Card.Title>{localization.auth.checkYourEmailTitle}</Card.Title>
      </Card.Header>
      <Card.Content className="gap-4">
        <Description>{description}</Description>
        {email ? (
          <>
            <OpenEmailButton email={email} />
            <Button
              onPress={() => {
                onResend()
                startCooldown()
              }}
              isDisabled={isCoolingDown}
              isPending={isPending}
            >
              {localization.auth.resend}
              {cooldown > 0 ? ` (${cooldown})` : ""}
            </Button>
          </>
        ) : null}
      </Card.Content>
      <Card.Footer>
        <Link view="signIn">{localization.auth.signIn}</Link>
      </Card.Footer>
    </Card>
  )
}

export function ResetLinkSent(props: AuthViewProps) {
  const { authClient, baseURL, basePaths, localization, viewPaths } = useAuth()
  const navigation = useAuthNavigation()
  const email = getPendingEmail("resetLinkSent") ?? navigation.getParam("email")
  const request = useRequestPasswordReset(authClient, {
    onSuccess: () => toast.success(localization.auth.passwordResetEmailSent)
  })
  return (
    <EmailLinkSent
      {...props}
      email={email}
      description={
        email
          ? localization.auth.resetLinkSentTo.replace("{{email}}", email)
          : localization.auth.passwordResetEmailSent
      }
      isPending={request.isPending}
      onResend={() =>
        email &&
        request.mutate({
          email,
          redirectTo: getViewURL(
            baseURL,
            basePaths.auth,
            viewPaths.auth.resetPassword
          )
        })
      }
    />
  )
}

export function MagicLinkSent(props: AuthViewProps) {
  const { authClient, baseURL, redirectTo } = useAuth()
  const { localization } = useAuthPlugin(magicLinkPlugin)
  const navigation = useAuthNavigation()
  const email = getPendingEmail("magicLinkSent") ?? navigation.getParam("email")
  const request = useSignInMagicLink(authClient as MagicLinkAuthClient, {
    onSuccess: () => toast.success(localization.magicLinkSent)
  })
  return (
    <EmailLinkSent
      {...props}
      email={email}
      description={localization.magicLinkSent}
      isPending={request.isPending}
      onResend={() =>
        email &&
        request.mutate({
          email,
          callbackURL: getAuthCallbackURL(baseURL, redirectTo)
        })
      }
    />
  )
}
