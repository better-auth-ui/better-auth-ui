"use client"

import {
  type TwoFactorAuthClient,
  useAuth,
  useAuthPlugin,
  useGenerateBackupCodes
} from "@better-auth-ui/react"
import { KeyRound } from "lucide-react"
import { type SyntheticEvent, useState } from "react"
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
import { BackupCodes } from "./backup-codes"

export type RegenerateBackupCodesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Replace the existing backup codes with a fresh set.
 *
 * The new codes are shown once, in component state only — closing the dialog
 * is the point of no return, which is why the copy button sits right there.
 *
 * @param open - Whether the dialog is open.
 * @param onOpenChange - Called when the dialog requests an open state change.
 */
export function RegenerateBackupCodesDialog({
  open,
  onOpenChange
}: RegenerateBackupCodesDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement()

  const [codes, setCodes] = useState<string[]>([])

  const {
    mutate: generateBackupCodes,
    isPending: isGenerating,
    reset: resetGeneration
  } = useGenerateBackupCodes(authClient as TwoFactorAuthClient, {
    onSuccess: (data) => {
      setCodes(data.backupCodes)
      toast.success(twoFactorLocalization.backupCodesRegenerated)
    }
  })

  const isPending = isGenerating || isResolvingPasswordRequirement

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      setCodes([])
      // Clears the resolved backup codes from the mutation cache.
      resetGeneration()
    }
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (codes.length) {
      handleOpenChange(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string

    generateBackupCodes(requiresPassword ? { password } : {})
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <KeyRound />
            </AlertDialogMedia>

            <AlertDialogTitle>
              {twoFactorLocalization.backupCodes}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {codes.length || !requiresPassword
                ? twoFactorLocalization.backupCodesDescription
                : twoFactorLocalization.passwordConfirmation}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {codes.length ? (
            <BackupCodes codes={codes} />
          ) : (
            requiresPassword && (
              <Field>
                <FieldLabel htmlFor="regenerate-backup-codes-password">
                  {localization.auth.password}
                </FieldLabel>

                <Input
                  id="regenerate-backup-codes-password"
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
            )
          )}

          <AlertDialogFooter>
            {!codes.length && (
              <AlertDialogCancel disabled={isPending}>
                {localization.settings.cancel}
              </AlertDialogCancel>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}

              {codes.length
                ? twoFactorLocalization.done
                : twoFactorLocalization.regenerateBackupCodes}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
