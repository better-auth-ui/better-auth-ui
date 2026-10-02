import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useAcceptInvitation,
  useRejectInvitation
} from "@better-auth-ui/react/plugins/organization"
import type { Invitation } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { formatDateTime } from "../../../lib/format-date"
import { useThemeColors } from "../../../lib/theme-colors"
import { Button } from "../../../primitives/button"
import { Box, Txt } from "../../../primitives/styled"
import { Chip } from "../../../primitives/tabs"
import { Check, Clock, Xmark } from "../../../primitives/ui-icons"

export type UserInvitationRowProps = {
  invitation: Invitation & { organizationName?: string }
}

/**
 * Single invitation row with accept/reject actions for the current user.
 * Mirrors the heroui `UserInvitationRow`, adapted for React Native: the
 * `div`-based layout becomes `View`/`Text`, the clock badge is a plain
 * `View` + icon (no CSS `bg-surface-secondary` box needed beyond a
 * className), and the accept/reject buttons rely on the RN `Button`
 * primitive's own pending indicator rather than manually swapping in a
 * `Spinner` alongside the icon.
 */
export function UserInvitationRow({ invitation }: UserInvitationRowProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()

  const { mutate: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation(authClient as OrganizationAuthClient)

  const { mutate: rejectInvitation, isPending: isRejecting } =
    useRejectInvitation(authClient as OrganizationAuthClient)

  return (
    <Box className="flex-row items-center gap-3">
      <Box className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        <Clock width={18} height={18} color={colors.muted} />
      </Box>

      <Box className="flex-1 gap-0.5">
        <Box className="flex-row items-center gap-1.5">
          <Txt
            numberOfLines={1}
            className="shrink text-sm font-medium leading-tight text-foreground"
          >
            {invitation.organizationName}
          </Txt>

          <Chip>{roles?.[invitation.role] ?? invitation.role}</Chip>
        </Box>

        <Txt numberOfLines={1} className="text-xs text-muted">
          {formatDateTime(invitation.createdAt)}
        </Txt>
      </Box>

      <Box className="ml-auto flex-row shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          isPending={isAccepting}
          isDisabled={isRejecting}
          onPress={() =>
            acceptInvitation({
              invitationId: invitation.id
            })
          }
        >
          <Check width={16} height={16} color={colors.foreground} />
          {organizationLocalization.accept}
        </Button>

        <Button
          variant="danger"
          size="sm"
          isIconOnly
          isPending={isRejecting}
          isDisabled={isAccepting}
          onPress={() =>
            rejectInvitation({
              invitationId: invitation.id
            })
          }
          aria-label={organizationLocalization.rejectInvitation}
        >
          <Xmark width={16} height={16} color={colors.dangerForeground} />
        </Button>
      </Box>
    </Box>
  )
}
