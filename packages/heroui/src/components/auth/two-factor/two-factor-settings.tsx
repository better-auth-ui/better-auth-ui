import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import { Button, Card, type CardProps, cn, Skeleton } from "@heroui/react"
import { useState } from "react"

import { twoFactorPlugin } from "../../../lib/auth/two-factor-plugin"
import { DisableTwoFactorDialog } from "./disable-two-factor-dialog"
import { EnableTwoFactorDialog } from "./enable-two-factor-dialog"
import { RegenerateBackupCodesDialog } from "./regenerate-backup-codes-dialog"

export type TwoFactorSettingsProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Security-settings card for enrolling in and managing two-factor auth.
 *
 * Reads `user.twoFactorEnabled` from the session — the field the Better Auth
 * two-factor plugin adds — so the card reflects enrollment without an extra
 * request.
 *
 * @param className - Additional CSS classes applied to the card.
 * @param variant - Card variant.
 */
export function TwoFactorSettings({
  className,
  variant,
  ...props
}: TwoFactorSettingsProps & Omit<CardProps, "children">) {
  const { authClient } = useAuth()
  const {
    backupCodes: backupCodesEnabled,
    localization: twoFactorLocalization
  } = useAuthPlugin(twoFactorPlugin)

  const { data: session, isPending } = useSession(authClient)
  const isEnabled = Boolean(
    (session?.user as { twoFactorEnabled?: boolean } | undefined)
      ?.twoFactorEnabled
  )

  const [enableOpen, setEnableOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)
  const [regenerateOpen, setRegenerateOpen] = useState(false)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold truncate">
          {twoFactorLocalization.twoFactor}
        </h2>

        <Button
          className="shrink-0"
          size="sm"
          variant={isEnabled ? "danger" : "primary"}
          isDisabled={isPending}
          onPress={() =>
            isEnabled ? setDisableOpen(true) : setEnableOpen(true)
          }
        >
          {isEnabled
            ? twoFactorLocalization.disableTwoFactor
            : twoFactorLocalization.enableTwoFactor}
        </Button>
      </div>

      <Card variant={variant} {...props}>
        <Card.Content className="gap-4">
          {isPending ? (
            <Skeleton className="h-5 w-48 rounded-lg" />
          ) : (
            <p className="text-sm font-medium">
              {isEnabled
                ? twoFactorLocalization.twoFactorEnabled
                : twoFactorLocalization.twoFactorDisabled}
            </p>
          )}

          <p className="text-muted text-sm">
            {twoFactorLocalization.twoFactorDescription}
          </p>

          {isEnabled && backupCodesEnabled && (
            <Button
              className="self-start"
              size="sm"
              variant="tertiary"
              onPress={() => setRegenerateOpen(true)}
            >
              {twoFactorLocalization.regenerateBackupCodes}
            </Button>
          )}
        </Card.Content>
      </Card>

      <EnableTwoFactorDialog isOpen={enableOpen} onOpenChange={setEnableOpen} />
      <DisableTwoFactorDialog
        isOpen={disableOpen}
        onOpenChange={setDisableOpen}
      />
      <RegenerateBackupCodesDialog
        isOpen={regenerateOpen}
        onOpenChange={setRegenerateOpen}
      />
    </div>
  )
}
