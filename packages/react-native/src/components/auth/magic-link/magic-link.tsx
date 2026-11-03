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
import { setPendingEmail } from "../../../lib/pending-email"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { magicLinkPlugin } from "../../../lib/auth/magic-link-plugin"
import { cn } from "../../../lib/cn"
import { Card, type CardVariant } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { useAuthForm } from "../auth-form"
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

/** Request a magic link with shared form validation and native navigation. */
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

  const { mutateAsync: signInMagicLink } = useSignInMagicLink(
    authClient as MagicLinkAuthClient,
    {
      meta: { errorPresentation: "inline" },
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

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await signInMagicLink({
        email: value.email.trim(),
        callbackURL: getAuthCallbackURL(baseURL, redirectTo)
      })
    }
  })

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

        <form.AppForm>
          <form.AuthFormRoot
            serverErrorMessage={localization.errors.generic}
            className="gap-4"
          >
            <form.AppField
              name="email"
              validators={{
                onChange: ({ value }) =>
                  validateEmailAddress(value, {
                    requiredMessage: localization.auth.fieldRequired,
                    invalidMessage: localization.auth.invalidEmail
                  })?.message
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  type="email"
                  autoComplete="email"
                  isDisabled={isPending}
                  label={localization.auth.email}
                  inputProps={{
                    placeholder: localization.auth.emailPlaceholder,
                    variant: inputVariant,
                    required: true
                  }}
                />
              )}
            </form.AppField>

            <Box className="gap-3">
              <form.AuthFormSubmitButton
                className="w-full"
                isPending={isPending}
              >
                {magicLinkLocalization.sendMagicLink}
                <LastUsedBadge method="magic-link" />
              </form.AuthFormSubmitButton>

              {plugins.flatMap((plugin) =>
                (plugin.authButtons ?? []).map((AuthButton) => (
                  <AuthButton
                    key={getAuthButtonKey(plugin.id, AuthButton)}
                    view="magicLink"
                  />
                ))
              )}
            </Box>
          </form.AuthFormRoot>
        </form.AppForm>

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
