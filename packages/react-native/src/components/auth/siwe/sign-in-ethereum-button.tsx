import { validateEmailAddress } from "@better-auth-ui/core"
import type { SiweAuthClient } from "@better-auth-ui/core/plugins/siwe"
import {
  useAuth,
  useAuthPlugin,
  type AuthButtonProps
} from "@better-auth-ui/react"
import { useSignInSiwe } from "@better-auth-ui/react/plugins/siwe"
import { useState } from "react"
import { siwePlugin } from "../../../lib/auth/siwe-plugin"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Description } from "../../../primitives/description"
import { useAuthForm, submitAuthForm } from "../auth-form"
import { LastUsedBadge } from "../last-login-method/last-used-badge"

export function SignInEthereumButton({
  view,
  className
}: AuthButtonProps): React.JSX.Element | null {
  const { authClient, localization } = useAuth()
  const plugin = useAuthPlugin(siwePlugin)
  const continueSignIn = useSignInContinuation()
  const [open, setOpen] = useState(false)
  const signIn = useSignInSiwe(authClient as SiweAuthClient, plugin)
  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      const email = value.email.trim()
      const result = await signIn.mutateAsync(email ? { email } : undefined)
      setOpen(false)
      continueSignIn(result)
    }
  })
  if (view === "signUp") return null
  return (
    <>
      <Button
        className={className}
        isPending={signIn.isPending}
        onPress={() =>
          plugin.email === "none"
            ? void submitAuthForm(form, localization.errors.walletFailed)
            : setOpen(true)
        }
      >
        {plugin.localization.continueWithEthereum}
        <LastUsedBadge method="siwe" />
      </Button>
      {plugin.email === "none" ? (
        <form.AppForm>
          <form.AuthFormServerError />
        </form.AppForm>
      ) : null}
      <AlertDialog
        isOpen={open}
        onOpenChange={(value) => {
          if (!signIn.isPending) setOpen(value)
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {plugin.localization.continueWithEthereum}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <form.AppForm>
          <form.AuthFormRoot
            className="gap-4"
            serverErrorMessage={localization.errors.walletFailed}
          >
            <Description>{plugin.localization.emailDescription}</Description>
            <form.AppField
              name="email"
              validators={{
                onChange: ({ value }) =>
                  value.trim() || plugin.email === "required"
                    ? validateEmailAddress(value, {
                        requiredMessage: localization.auth.fieldRequired,
                        invalidMessage: localization.auth.invalidEmail
                      })
                    : undefined
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  label={
                    plugin.email === "required"
                      ? plugin.localization.email
                      : plugin.localization.emailOptional
                  }
                  type="email"
                  isDisabled={signIn.isPending}
                />
              )}
            </form.AppField>
            <AlertDialog.Footer>
              <Button
                isDisabled={signIn.isPending}
                onPress={() => setOpen(false)}
              >
                {localization.settings.cancel}
              </Button>
              <form.AuthFormSubmitButton isPending={signIn.isPending}>
                {plugin.localization.signMessage}
              </form.AuthFormSubmitButton>
            </AlertDialog.Footer>
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialog>
    </>
  )
}
