import { getViewURL, validateEmailAddress } from "@better-auth-ui/core"
import {
  AuthLink,
  type AuthPlugin,
  useAuth,
  useFetchOptions,
  useRequestPasswordReset
} from "@better-auth-ui/solid"
import { Show } from "solid-js"
import { RESET_LINK_SENT_STORAGE_KEY } from "@/components/auth/reset-link-sent"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createAuthForm, isAuthFormFieldInvalid } from "./auth-form"

export type ForgotPasswordProps = {
  class?: string
  redirectTo?: string
}

export function ForgotPassword(props: ForgotPasswordProps) {
  const auth = useAuth()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const requestReset = useRequestPasswordReset(auth.authClient, () => ({
    onError: () => {
      resetFetchOptions()
    },
    onSuccess: (_data, variables) => {
      sessionStorage.setItem(RESET_LINK_SENT_STORAGE_KEY, variables.email)
      auth.navigate({
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.resetLinkSent}`
      })
    }
  }))

  const captchaComponent = () =>
    (auth.plugins as AuthPlugin[]).find((plugin) => plugin.captchaComponent)
      ?.captchaComponent

  const form = createAuthForm(() => ({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await requestReset.mutateAsync({
        email: value.email,
        fetchOptions: fetchOptions(),
        redirectTo:
          props.redirectTo ??
          getViewURL(
            auth.baseURL,
            auth.basePaths.auth,
            auth.viewPaths.auth.resetPassword
          )
      } as Parameters<typeof requestReset.mutateAsync>[0])
    }
  }))

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.forgotPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form.AppForm>
          <form.AuthFormRoot aria-label="Forgot password">
            <div class="flex flex-col gap-6">
              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    validateEmailAddress(value, {
                      invalidMessage: auth.localization.auth.invalidEmail,
                      requiredMessage: auth.localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={isAuthFormFieldInvalid(field().state.meta)}
                  >
                    <FieldLabel for="forgot-password-email">
                      {auth.localization.auth.email}
                    </FieldLabel>
                    <Input
                      aria-invalid={isAuthFormFieldInvalid(field().state.meta)}
                      id="forgot-password-email"
                      name={field().name}
                      onBlur={field().handleBlur}
                      onInput={(event) =>
                        field().handleChange(event.currentTarget.value)
                      }
                      placeholder={auth.localization.auth.emailPlaceholder}
                      type="email"
                      value={field().state.value}
                    />
                    <field.AuthFormFieldError />
                  </Field>
                )}
              </form.AppField>
              <Show when={captchaComponent()} keyed>
                {(Captcha) => <Captcha />}
              </Show>
              <form.AuthFormSubmitButton disabled={requestReset.isPending}>
                {requestReset.isPending
                  ? `${auth.localization.auth.sendResetLink}…`
                  : auth.localization.auth.sendResetLink}
              </form.AuthFormSubmitButton>
              <form.AuthFormServerError />
            </div>
          </form.AuthFormRoot>
        </form.AppForm>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.rememberYourPassword}{" "}
            <AuthLink
              class="underline underline-offset-4"
              href={`${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`}
            >
              {auth.localization.auth.signIn}
            </AuthLink>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
