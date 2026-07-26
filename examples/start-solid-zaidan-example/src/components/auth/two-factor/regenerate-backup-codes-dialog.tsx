import {
  generateBackupCodesOptions,
  type TwoFactorAuthClient,
  useAuth,
  useAuthPlugin
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { KeyRound } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"

import { BackupCodes } from "@/components/auth/two-factor/backup-codes"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "@/lib/auth/use-two-factor-password"

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

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    if (codes().length) {
      props.onOpenChange(false)
      return
    }

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")

    generateBackupCodes.mutate(
      (requiresPassword() ? { password } : {}) as Parameters<
        typeof generateBackupCodes.mutate
      >[0]
    )
  }

  return (
    <DialogContent>
      <form class="flex flex-col gap-6" onSubmit={submit}>
        <DialogHeader>
          <div class="flex size-10 items-center justify-center rounded-md bg-muted">
            <KeyRound class="size-4.5" />
          </div>

          <DialogTitle>{twoFactorLocalization.backupCodes}</DialogTitle>

          <DialogDescription>
            {codes().length || !requiresPassword()
              ? twoFactorLocalization.backupCodesDescription
              : twoFactorLocalization.passwordConfirmation}
          </DialogDescription>
        </DialogHeader>

        <Show
          when={codes().length}
          fallback={
            <Show when={requiresPassword()}>
              <div class="grid gap-2">
                <Label for="regenerate-backup-codes-password">
                  {auth.localization.auth.password}
                </Label>

                <Input
                  autocomplete="current-password"
                  autofocus
                  disabled={isPending()}
                  id="regenerate-backup-codes-password"
                  name="password"
                  placeholder={auth.localization.auth.passwordPlaceholder}
                  required
                  type="password"
                />
              </div>
            </Show>
          }
        >
          <BackupCodes codes={codes()} />
        </Show>

        <DialogFooter>
          <Show when={!codes().length}>
            <DialogClose
              as={Button}
              disabled={isPending()}
              type="button"
              variant="outline"
            >
              {auth.localization.settings.cancel}
            </DialogClose>
          </Show>

          <Button disabled={isPending()} type="submit">
            <Show when={isPending()}>
              <Spinner />
            </Show>

            {codes().length
              ? twoFactorLocalization.done
              : twoFactorLocalization.regenerateBackupCodes}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
