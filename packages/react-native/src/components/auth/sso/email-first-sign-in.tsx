import { getAuthCallbackURL, validateEmailAddress } from "@better-auth-ui/core"
import type { SsoAuthClient } from "@better-auth-ui/core/plugins/sso"
import { AuthPrompts, useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInSso } from "@better-auth-ui/react/plugins/sso"
import { useState } from "react"
import { ssoPlugin } from "../../../lib/auth/sso-plugin"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { openExternalURL } from "../../../lib/open-external-url"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { useAuthForm } from "../auth-form"
import { SignIn } from "../sign-in"

export function EmailFirstSignIn(props: AuthViewProps) {
  const { authClient, localization: common, baseURL, redirectTo } = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const [fallbackEmail, setFallbackEmail] = useState<string>()
  const discover = useSignInSso(authClient as SsoAuthClient)
  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      const email = value.email.trim()
      try {
        const result = await discover.mutateAsync({
          email,
          loginHint: email,
          callbackURL: getAuthCallbackURL(baseURL, redirectTo)
        })
        await openExternalURL(result.url, baseURL)
      } catch (error) {
        if ((error as { status?: number }).status === 404)
          setFallbackEmail(email)
        else throw error
      }
    }
  })
  if (fallbackEmail !== undefined)
    return (
      <>
        <Description>{localization.noProvider}</Description>
        <SignIn {...props} initialEmail={fallbackEmail} />
        <Button onPress={() => setFallbackEmail(undefined)}>
          {localization.useDifferentEmail}
        </Button>
      </>
    )
  return (
    <Card className={props.className} variant={props.variant}>
      <AuthPrompts view="signIn" />
      <Card.Header>
        <Card.Title>{common.auth.signIn}</Card.Title>
        <Description>{localization.emailFirstDescription}</Description>
      </Card.Header>
      <Card.Content>
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            <form.AppField
              name="email"
              validators={{
                onChange: ({ value }) =>
                  validateEmailAddress(value, {
                    requiredMessage: common.auth.fieldRequired,
                    invalidMessage: common.auth.invalidEmail
                  })
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  label={common.auth.email}
                  type="email"
                  autoComplete="email"
                  isDisabled={discover.isPending}
                />
              )}
            </form.AppField>
            <form.AuthFormSubmitButton isPending={discover.isPending}>
              {localization.continueWithEmail}
            </form.AuthFormSubmitButton>
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>
    </Card>
  )
}
