import { authMutationKeys, validateEmailAddress } from "@better-auth-ui/core"
import type { MagicLinkAuthClient } from "@better-auth-ui/core/plugins/magic-link"
import { getSsoFallbackEmail } from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInMagicLink } from "@better-auth-ui/react/plugins/magic-link"
import {
  Card,
  type CardProps,
  cn,
  Description,
  Input,
  Label,
  Link,
  Spinner,
  TextField
} from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"

import { magicLinkPlugin } from "../../../lib/auth/magic-link-plugin"
import { useAuthForm } from "../auth-form"
import { FieldSeparator } from "../field-separator"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"
import { MAGIC_LINK_SENT_STORAGE_KEY } from "./magic-link-sent"

export type MagicLinkProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

/**
 * Magic-link sign-in form.
 *
 * @param socialLayout - Provider button layout.
 * @param socialPosition - `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @param variant - Card variant.
 */
export function MagicLink({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
}: MagicLinkProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    navigate,
    plugins,
    redirectTo,
    socialProviders,
    viewPaths
  } = useAuth()
  const { localization: magicLinkLocalization, viewPaths: magicLinkViewPaths } =
    useAuthPlugin(magicLinkPlugin)

  const { mutateAsync: signInMagicLink, isPending: signInMagicLinkPending } =
    useSignInMagicLink(authClient as MagicLinkAuthClient, {
      onSuccess: (_data, variables) => {
        sessionStorage.setItem(MAGIC_LINK_SENT_STORAGE_KEY, variables.email)
        navigate({
          to: `${basePaths.auth}/${magicLinkViewPaths.auth.magicLinkSent}`
        })
      }
    })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const form = useAuthForm({
    defaultValues: { email: getSsoFallbackEmail() },
    onSubmit: async ({ value }) =>
      await signInMagicLink({
        email: value.email,
        callbackURL: `${baseURL}${redirectTo}`
      })
  })

  const showSeparator = !!socialProviders?.length

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.signIn}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        {socialPosition === "top" && (
          <>
            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} view="magicLink" />
            )}

            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}
          </>
        )}

        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-4">
            <form.AppField
              name="email"
              validators={{
                onChange: ({ value }) =>
                  validateEmailAddress(value, {
                    invalidMessage: localization.auth.invalidEmail,
                    requiredMessage: localization.auth.fieldRequired
                  })
              }}
            >
              {(field) => (
                <TextField
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  isDisabled={isPending}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                >
                  <Label>{localization.auth.email}</Label>

                  <Input
                    placeholder={localization.auth.emailPlaceholder}
                    required
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                  />

                  <field.AuthFormFieldError />
                </TextField>
              )}
            </form.AppField>

            <form.AuthFormServerError />

            <div className="flex flex-col gap-3">
              <form.AuthFormSubmitButton
                className="w-full"
                isDisabled={isPending}
              >
                {signInMagicLinkPending && (
                  <Spinner color="current" size="sm" />
                )}

                {magicLinkLocalization.sendMagicLink}
              </form.AuthFormSubmitButton>

              {plugins.flatMap((plugin) =>
                (plugin.authButtons ?? []).map((AuthButton, index) => (
                  <AuthButton
                    key={`${plugin.id}-${index.toString()}`}
                    view="magicLink"
                  />
                ))
              )}
            </div>
          </form.AuthFormRoot>
        </form.AppForm>

        {socialPosition === "bottom" && (
          <>
            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}

            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} view="magicLink" />
            )}
          </>
        )}
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
