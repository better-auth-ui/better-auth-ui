import { isTwoFactorRedirect } from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useSession, useSignInEmail } from "@better-auth-ui/react"
import { Button, Input, Label, Spinner, TextField } from "@heroui/react"
import { useSelector } from "@tanstack/react-form"
import { useSignInContinuation } from "../../../../lib/auth/use-sign-in-continuation"
import { useAuthForm } from "../../auth-form"

export interface FreshSessionPromptProps {
  onFresh: () => unknown | Promise<unknown>
}

/** Inline step-up authentication for settings protected by `freshSessionMiddleware`. */
export function FreshSessionPrompt({ onFresh }: FreshSessionPromptProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    navigate,
    viewPaths
  } = useAuth()
  const session = useSession(authClient)
  const continueSignIn = useSignInContinuation()
  const signIn = useSignInEmail(authClient, {
    meta: { errorPresentation: "inline" },
    onError: () => form.setFieldValue("password", ""),
    onSuccess: async (data) => {
      if (isTwoFactorRedirect(data)) {
        continueSignIn(data)
        return
      }

      form.setFieldValue("password", "")
      await onFresh()
    }
  })

  const form = useAuthForm({
    defaultValues: { password: "" },
    onSubmit: ({ value }) => {
      const email = session.data?.user.email
      if (!email) return
      signIn.mutate({ email, password: value.password })
    }
  })
  const passwordIsEmpty = useSelector(
    form.store,
    (state) => state.values.password.length === 0
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">
          {localization.settings.freshSessionTitle}
        </h3>
        <p className="text-sm text-muted">
          {localization.settings.freshSessionDescription}
        </p>
      </div>

      {emailAndPassword?.enabled ? (
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-3">
            <form.AppField name="password">
              {(field) => (
                <TextField
                  isDisabled={signIn.isPending}
                  isInvalid={signIn.isError}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                >
                  <Label>{localization.auth.password}</Label>
                  <Input
                    autoComplete="current-password"
                    name="password"
                    placeholder={localization.auth.passwordPlaceholder}
                    type="password"
                    required
                  />
                </TextField>
              )}
            </form.AppField>
            {signIn.error && (
              <p className="text-sm text-danger" role="alert">
                {signIn.error.error?.message ?? signIn.error.message}
              </p>
            )}
            <form.AuthFormSubmitButton
              isDisabled={passwordIsEmpty}
              variant="primary"
            >
              {signIn.isPending && <Spinner color="current" size="sm" />}
              {localization.settings.freshSessionSubmit}
            </form.AuthFormSubmitButton>
          </form.AuthFormRoot>
        </form.AppForm>
      ) : (
        <Button
          onPress={() =>
            navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
          }
          variant="primary"
        >
          {localization.settings.freshSessionSignIn}
        </Button>
      )}
    </div>
  )
}
