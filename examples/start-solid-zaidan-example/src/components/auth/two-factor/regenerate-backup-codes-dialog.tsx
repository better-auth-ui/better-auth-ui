import { validateStringLength } from "@better-auth-ui/core"
import {
  generateBackupCodesOptions,
  type TwoFactorAuthClient
} from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { KeyRound } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"

import { BackupCodes } from "@/components/auth/two-factor/backup-codes"
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

/**
 * Replace the existing backup codes with a fresh set.
 *
 * The new codes are shown once, in component state only — closing the dialog
 * is the point of no return, which is why the copy button sits right there.
 */
export function RegenerateBackupCodesDialog(props: {
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement()

  const [codes, setCodes] = createSignal<string[]>([])

  const generateBackupCodes = createMutation(() => ({
    ...generateBackupCodesOptions(auth.authClient as TwoFactorAuthClient),
    onSuccess: (data) => {
      setCodes(data.backupCodes)
      toast.success(twoFactorLocalization.backupCodesRegenerated)
    }
  }))

  const isPending = () =>
    generateBackupCodes.isPending || isResolvingPasswordRequirement()

  const form = createAuthForm(() => ({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      if (codes().length) {
        props.onOpenChange(false)
        return
      }
      await generateBackupCodes.mutateAsync(
        (requiresPassword() ? { password: value.password } : {}) as Parameters<
          typeof generateBackupCodes.mutateAsync
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
              <KeyRound />
            </AlertDialogMedia>

            <AlertDialogTitle>
              {twoFactorLocalization.backupCodes}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {codes().length || !requiresPassword()
                ? twoFactorLocalization.backupCodesDescription
                : twoFactorLocalization.passwordConfirmation}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Show
            when={codes().length}
            fallback={
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
                      <FieldLabel for="regenerate-backup-codes-password">
                        {auth.localization.auth.password}
                      </FieldLabel>

                      <Input
                        autocomplete="current-password"
                        autofocus
                        disabled={isPending()}
                        id="regenerate-backup-codes-password"
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
            }
          >
            <BackupCodes codes={codes()} />
          </Show>

          <AlertDialogFooter>
            <Show when={!codes().length}>
              <AlertDialogCancel disabled={isPending()} type="button">
                {auth.localization.settings.cancel}
              </AlertDialogCancel>
            </Show>

            <form.AuthFormSubmitButton
              isPending={isPending()}
              disabled={isPending()}
            >
              {codes().length
                ? twoFactorLocalization.done
                : twoFactorLocalization.regenerateBackupCodes}
            </form.AuthFormSubmitButton>
          </AlertDialogFooter>
          <form.AuthFormServerError />
        </form.AuthFormRoot>
      </form.AppForm>
    </AlertDialogContent>
  )
}
