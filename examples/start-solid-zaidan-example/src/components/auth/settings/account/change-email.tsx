import { getViewURL, validateEmailAddress } from "@better-auth-ui/core"
import { useAuth, useChangeEmail, useSession } from "@better-auth-ui/solid"
import { toast } from "solid-sonner"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createAuthForm, isAuthFormFieldInvalid } from "../../auth-form"

export type ChangeEmailProps = {
  class?: string
}

export function ChangeEmail(props: ChangeEmailProps = {}) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const changeEmail = useChangeEmail(auth.authClient, () => ({
    onSuccess: () =>
      toast.success(auth.localization.settings.changeEmailSuccess)
  }))

  const form = createAuthForm(() => ({
    defaultValues: { email: session.data?.user.email ?? "" },
    onSubmit: async ({ value }) => {
      await changeEmail.mutateAsync({
        callbackURL: getViewURL(
          auth.baseURL,
          auth.basePaths.settings,
          auth.viewPaths.settings.account
        ),
        newEmail: value.email
      } as Parameters<typeof changeEmail.mutateAsync>[0])
    }
  }))

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.changeEmail}
      </h2>
      <form.AppForm>
        <form.AuthFormRoot>
          <Card>
            <CardContent class="flex flex-col gap-6">
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
                    <FieldLabel for="settings-email">
                      {auth.localization.auth.email}
                    </FieldLabel>
                    <Input
                      aria-invalid={isAuthFormFieldInvalid(field().state.meta)}
                      autocomplete="email"
                      disabled={changeEmail.isPending || !session.data}
                      id="settings-email"
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
            </CardContent>
            <CardFooter>
              <form.AuthFormSubmitButton
                disabled={changeEmail.isPending || !session.data}
                size="sm"
              >
                {auth.localization.settings.updateEmail}
              </form.AuthFormSubmitButton>
            </CardFooter>
          </Card>
          <form.AuthFormServerError />
        </form.AuthFormRoot>
      </form.AppForm>
    </div>
  )
}
