"use client"

import type { TwoFactorAuthClient } from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDisableTwoFactor } from "@better-auth-ui/react/plugins/two-factor"
import { ShieldAlert } from "lucide-react"
import type { SyntheticEvent } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "@/lib/auth/use-two-factor-password"

export type DisableTwoFactorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Confirm turning two-factor off.
 *
 * @param open - Whether the dialog is open.
 * @param onOpenChange - Called when the dialog requests an open state change.
 */
export function DisableTwoFactorDialog({
  open,
  onOpenChange
}: DisableTwoFactorDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement()

  const { mutate: disableTwoFactor, isPending: isDisabling } =
    useDisableTwoFactor(authClient as TwoFactorAuthClient, {
      onSuccess: () => {
        toast.success(twoFactorLocalization.twoFactorDisabled)
        onOpenChange(false)
      }
    })

  const isPending = isDisabling || isResolvingPasswordRequirement

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string

    disableTwoFactor(requiresPassword ? { password } : {})
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <ShieldAlert />
            </AlertDialogMedia>

            <AlertDialogTitle>
              {twoFactorLocalization.disableTwoFactor}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {requiresPassword
                ? twoFactorLocalization.passwordConfirmation
                : twoFactorLocalization.twoFactorDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {requiresPassword && (
            <Field>
              <FieldLabel htmlFor="disable-two-factor-password">
                {localization.auth.password}
              </FieldLabel>

              <Input
                id="disable-two-factor-password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                placeholder={localization.auth.passwordPlaceholder}
                disabled={isPending}
              />

              <FieldError />
            </Field>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {localization.settings.cancel}
            </AlertDialogCancel>

            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <Spinner />}

              {twoFactorLocalization.disableTwoFactor}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
