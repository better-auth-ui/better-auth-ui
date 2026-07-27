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
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "@/lib/auth/use-two-factor-password"

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

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")

    disableTwoFactor.mutate(
      (requiresPassword() ? { password } : {}) as Parameters<
        typeof disableTwoFactor.mutate
      >[0]
    )
  }

  return (
    <AlertDialogContent>
      <form class="flex flex-col gap-6" onSubmit={submit}>
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
          <Field>
            <FieldLabel for="disable-two-factor-password">
              {auth.localization.auth.password}
            </FieldLabel>

            <Input
              autocomplete="current-password"
              autofocus
              disabled={isPending()}
              id="disable-two-factor-password"
              name="password"
              placeholder={auth.localization.auth.passwordPlaceholder}
              required
              type="password"
            />
          </Field>
        </Show>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending()} type="button">
            {auth.localization.settings.cancel}
          </AlertDialogCancel>

          <Button disabled={isPending()} type="submit" variant="destructive">
            <Show when={isPending()}>
              <Spinner />
            </Show>

            {twoFactorLocalization.disableTwoFactor}
          </Button>
        </AlertDialogFooter>
      </form>
    </AlertDialogContent>
  )
}
