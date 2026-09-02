import { validateStringLength } from "@better-auth-ui/core"
import { isTwoFactorRedirect } from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useSession, useSignInEmail } from "@better-auth-ui/solid"
import { Show } from "solid-js"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSignInContinuation } from "@/lib/auth/use-sign-in-continuation"
import { createAuthForm, isAuthFormFieldInvalid } from "../../auth-form"

export interface FreshSessionPromptProps {
  onFresh: () => unknown | Promise<unknown>
}

export function FreshSessionPrompt(props: FreshSessionPromptProps) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const continueSignIn = useSignInContinuation()
  const signIn = useSignInEmail(auth.authClient, () => ({
    meta: { errorPresentation: "inline" },
    onError: () => form.setFieldValue("password", ""),
    onSuccess: async (data) => {
      if (isTwoFactorRedirect(data)) {
        continueSignIn(data)
        return
      }
      form.setFieldValue("password", "")
      await props.onFresh()
    }
  }))

  const form = createAuthForm(() => ({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      const email = session.data?.user.email
      if (!email) return
      await signIn.mutateAsync({ email, password: value.password })
    }
  }))

  return (
    <div class="p-4">
      <FieldGroup class="gap-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-medium">
            {auth.localization.settings.freshSessionTitle}
          </h3>
          <FieldDescription>
            {auth.localization.settings.freshSessionDescription}
          </FieldDescription>
        </div>
        <Show
          fallback={
            <Button
              onClick={() =>
                auth.navigate({
                  to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
                })
              }
            >
              {auth.localization.settings.freshSessionSignIn}
            </Button>
          }
          when={auth.emailAndPassword?.enabled}
        >
          <form.AppForm>
            <form.AuthFormRoot class="flex flex-col gap-3">
              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: auth.localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={isAuthFormFieldInvalid(field().state.meta)}
                  >
                    <FieldLabel for="fresh-session-password">
                      {auth.localization.auth.password}
                    </FieldLabel>
                    <Input
                      id="fresh-session-password"
                      autocomplete="current-password"
                      disabled={signIn.isPending}
                      name={field().name}
                      value={field().state.value}
                      onBlur={field().handleBlur}
                      onInput={(event) =>
                        field().handleChange(event.currentTarget.value)
                      }
                      type="password"
                    />
                    <field.AuthFormFieldError />
                  </Field>
                )}
              </form.AppField>
              <form.AuthFormServerError />
              <form.AuthFormSubmitButton disabled={signIn.isPending}>
                {auth.localization.settings.freshSessionSubmit}
              </form.AuthFormSubmitButton>
            </form.AuthFormRoot>
          </form.AppForm>
        </Show>
      </FieldGroup>
    </div>
  )
}
