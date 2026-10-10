import { getAuthButtonKey } from "@better-auth-ui/react"
import { LastUsedBadge } from "../last-login-method/last-used-badge"
import {
  authMutationKeys,
  getAuthCallbackURL,
  validateEmailAddress
} from "@better-auth-ui/core"
import type { MagicLinkAuthClient } from "@better-auth-ui/core/plugins/magic-link"
import { AuthPrompts, useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInMagicLink } from "@better-auth-ui/react/plugins/magic-link"
import { useIsMutating } from "@tanstack/react-query"
import { useState } from "react"
import { setPendingEmail } from "../../../lib/pending-email"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { magicLinkPlugin } from "../../../lib/auth/magic-link-plugin"
import { cn } from "../../../lib/cn"
import { Button } from "../../../primitives/button"
import { Card, type CardVariant } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { FieldError, Label, TextField } from "../../../primitives/field"
import { Form } from "../../../primitives/form"
import { Input } from "../../../primitives/input"
import { Link } from "../../../primitives/link"
import { Box } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { FieldSeparator } from "../field-separator"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"

export interface MagicLinkProps {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardVariant
}

/**
 * Magic-link sign-in form: a single email field + send button, plus the
 * shared social-provider affordances. Mirrors the heroui `MagicLink`, adapted
 * for React Native: the email field is controlled state (no `FormData`), and
 * the submit handler has no DOM `SyntheticEvent` to prevent-default on.
 */
export function MagicLink({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
}: MagicLinkProps) {
  const {
    authClient,
    baseURL,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,
    socialProviders
  } = useAuth()
  const { localization: magicLinkLocalization } = useAuthPlugin(magicLinkPlugin)

  const navigation = useAuthNavigation()
  const [email, setEmail] = useState("")

  const { mutate: signInMagicLink } = useSignInMagicLink(
    authClient as MagicLinkAuthClient,
    {
      onSuccess: (_data, { email: submittedEmail }) => {
        setPendingEmail(submittedEmail, "magicLinkSent")
        navigation.push("magicLinkSent", { params: { redirectTo } })
        toast.success(magicLinkLocalization.magicLinkSent)
      }
    }
  )

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const handleSubmit = () => {
    signInMagicLink({
      email: email.trim(),
      callbackURL: getAuthCallbackURL(baseURL, redirectTo)
    })
  }

  const showSeparator = !!socialProviders?.length
  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <AuthPrompts view="magicLink" />
      <Card.Header>
        <Card.Title className="mb-1">{localization.auth.signIn}</Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        {socialPosition === "top" && (
          <>
            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} />
            )}

            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}
          </>
        )}

        <Form onSubmit={handleSubmit} className="gap-4">
          <TextField
            name="email"
            type="email"
            autoComplete="email"
            isDisabled={isPending}
            value={email}
            onChange={setEmail}
            validate={(value) =>
              validateEmailAddress(value, {
                requiredMessage: localization.auth.fieldRequired,
                invalidMessage: localization.auth.invalidEmail
              })?.message
            }
          >
            <Label>{localization.auth.email}</Label>

            <Input
              placeholder={localization.auth.emailPlaceholder}
              variant={inputVariant}
              required
            />

            <FieldError />
          </TextField>

          <Box className="gap-3">
            <Button type="submit" className="w-full" isPending={isPending}>
              {magicLinkLocalization.sendMagicLink}
              <LastUsedBadge method="magic-link" />
            </Button>

            {plugins.flatMap((plugin) =>
              (plugin.authButtons ?? []).map((AuthButton) => (
                <AuthButton
                  key={getAuthButtonKey(plugin.id, AuthButton)}
                  view="magicLink"
                />
              ))
            )}
          </Box>
        </Form>

        {socialPosition === "bottom" && (
          <>
            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}

            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} />
            )}
          </>
        )}
      </Card.Content>

      {emailAndPassword?.enabled && (
        <Card.Footer className="flex-col gap-3">
          <Description className="text-sm">
            {localization.auth.needToCreateAnAccount}{" "}
            <Link view="signUp">{localization.auth.signUp}</Link>
          </Description>
        </Card.Footer>
      )}
    </Card>
  )
}
