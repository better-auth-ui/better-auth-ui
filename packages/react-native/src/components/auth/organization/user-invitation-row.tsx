import {
  type OrganizationAuthClient,
  useAcceptInvitation,
  useAuth,
  useAuthPlugin,
  useRejectInvitation
} from "@better-auth-ui/react"
import type { Invitation } from "better-auth/client"
import { Text, View } from "react-native"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { formatDateTime } from "../../../lib/format-date"
import { useThemeColors } from "../../../lib/theme-colors"
import { Button } from "../../../primitives/button"
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
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        <Clock width={18} height={18} color={colors.muted} />
      </View>

      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-1.5">
          <Text
            numberOfLines={1}
            className="shrink text-sm font-medium leading-tight text-foreground"
          >
            {invitation.organizationName}
          </Text>

          <Chip>{roles?.[invitation.role] ?? invitation.role}</Chip>
        </View>

        <Text numberOfLines={1} className="text-xs text-muted">
          {formatDateTime(invitation.createdAt)}
        </Text>
      </View>

      <View className="ml-auto flex-row shrink-0 items-center gap-2">
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
      </View>
    </View>
  )
}
