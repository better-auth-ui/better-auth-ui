import { validateStringLength } from "@better-auth-ui/core"
import {
  disableTwoFactorOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { ShieldAlert } from "lucide-solid"
import { Show } from "solid-js"
import { toast } from "solid-sonner"

import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "@/lib/auth/use-two-factor-password"
import { createAuthForm } from "../auth-form"

/** Confirm turning two-factor off. */
export function DisableTwoFactorDialog(props: {
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement()

  const disableTwoFactor = createMutation(() => ({
    ...disableTwoFactorOptions(auth.authClient as TwoFactorAuthClient),
    onSuccess: () => {
      toast.success(twoFactorLocalization.twoFactorDisabled)
      props.onOpenChange(false)
    }
  }))

  const isPending = () =>
    disableTwoFactor.isPending || isResolvingPasswordRequirement()

  const form = createAuthForm(() => ({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      await disableTwoFactor.mutateAsync(
        (requiresPassword() ? { password: value.password } : {}) as Parameters<
          typeof disableTwoFactor.mutateAsync
        >[0]
      )
    }
  }))

  return (
    <AlertDialogContent>
      <form.AppForm>
        <form.AuthFormRoot class="flex flex-col gap-6">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ShieldAlert />
            </AlertDialogMedia>

            <AlertDialogTitle>
              {twoFactorLocalization.disableTwoFactor}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {requiresPassword()
                ? twoFactorLocalization.passwordConfirmation
                : twoFactorLocalization.twoFactorDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Show when={requiresPassword()}>
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
                <Field>
                  <FieldLabel for="disable-two-factor-password">
                    {auth.localization.auth.password}
                  </FieldLabel>

                  <Input
                    autocomplete="current-password"
                    autofocus
                    disabled={isPending()}
                    id="disable-two-factor-password"
                    name={field().name}
                    placeholder={auth.localization.auth.passwordPlaceholder}
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
          </Show>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending()} type="button">
              {auth.localization.settings.cancel}
            </AlertDialogCancel>

            <form.AuthFormSubmitButton
              isPending={isPending()}
              disabled={isPending()}
              variant="destructive"
            >
              {twoFactorLocalization.disableTwoFactor}
            </form.AuthFormSubmitButton>
          </AlertDialogFooter>
          <form.AuthFormServerError />
        </form.AuthFormRoot>
      </form.AppForm>
    </AlertDialogContent>
  )
}
