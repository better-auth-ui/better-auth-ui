import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import { createSignal, Show } from "solid-js"

import { DisableTwoFactorDialog } from "@/components/auth/two-factor/disable-two-factor-dialog"
import { EnableTwoFactorDialog } from "@/components/auth/two-factor/enable-two-factor-dialog"
import { RegenerateBackupCodesDialog } from "@/components/auth/two-factor/regenerate-backup-codes-dialog"
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import { cn } from "@/lib/utils"

export type TwoFactorSettingsProps = {
  class?: string
}

/**
 * Security-settings card for enrolling in and managing two-factor auth.
 *
 * Reads `user.twoFactorEnabled` from the session — the field the Better Auth
 * two-factor plugin adds — so the card reflects enrollment without an extra
 * request.
 */
export function TwoFactorSettings(props: TwoFactorSettingsProps = {}) {
  const auth = useAuth()
  const {
    backupCodes: backupCodesEnabled,
    localization: twoFactorLocalization
  } = useAuthPlugin(twoFactorPlugin)

  const session = useSession(auth.authClient)
  const isEnabled = () =>
    Boolean(
      (session.data?.user as { twoFactorEnabled?: boolean } | undefined)
        ?.twoFactorEnabled
    )

  const [isEnableOpen, setIsEnableOpen] = createSignal(false)
  const [isDisableOpen, setIsDisableOpen] = createSignal(false)
  const [isRegenerateOpen, setIsRegenerateOpen] = createSignal(false)

  return (
    <div class={cn("flex flex-col gap-3", props.class)}>
      <div class="flex items-end justify-between gap-3">
        <h2 class="truncate text-sm font-semibold">
          {twoFactorLocalization.twoFactor}
        </h2>

        <Show
          when={isEnabled()}
          fallback={
            <Dialog open={isEnableOpen()} onOpenChange={setIsEnableOpen}>
              <DialogTrigger
                as={Button}
                class="shrink-0"
                disabled={session.isPending}
                size="sm"
              >
                {twoFactorLocalization.enableTwoFactor}
              </DialogTrigger>

              <EnableTwoFactorDialog onOpenChange={setIsEnableOpen} />
            </Dialog>
          }
        >
          <AlertDialog open={isDisableOpen()} onOpenChange={setIsDisableOpen}>
            <AlertDialogTrigger
              as={Button}
              class="shrink-0"
              disabled={session.isPending}
              size="sm"
              variant="destructive"
            >
              {twoFactorLocalization.disableTwoFactor}
            </AlertDialogTrigger>

            <DisableTwoFactorDialog onOpenChange={setIsDisableOpen} />
          </AlertDialog>
        </Show>
      </div>

      <Card>
        <CardContent class="flex flex-col gap-4">
          <Show
            when={!session.isPending}
            fallback={<Skeleton class="h-5 w-48" />}
          >
            <p class="text-sm font-medium">
              {isEnabled()
                ? twoFactorLocalization.twoFactorEnabled
                : twoFactorLocalization.twoFactorDisabled}
            </p>
          </Show>

          <p class="text-muted-foreground text-sm">
            {twoFactorLocalization.twoFactorDescription}
          </p>

          <Show when={isEnabled() && backupCodesEnabled}>
            <AlertDialog
              open={isRegenerateOpen()}
              onOpenChange={setIsRegenerateOpen}
            >
              <AlertDialogTrigger
                as={Button}
                class="self-start"
                size="sm"
                variant="outline"
              >
                {twoFactorLocalization.regenerateBackupCodes}
              </AlertDialogTrigger>

              <RegenerateBackupCodesDialog onOpenChange={setIsRegenerateOpen} />
            </AlertDialog>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}
