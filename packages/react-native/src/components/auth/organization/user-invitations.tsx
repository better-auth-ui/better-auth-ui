import {
  type OrganizationAuthClient,
  useAcceptInvitation,
  useAuth,
  useAuthPlugin,
  useListUserInvitations,
  useRejectInvitation
} from "@better-auth-ui/react"
import { Text, View } from "react-native"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { formatDateTime } from "../../../lib/format-date"
import { useThemeColors } from "../../../lib/theme-colors"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Skeleton } from "../../../primitives/skeleton"
import { Chip, EmptyState } from "../../../primitives/tabs"
import { Check, Clock, Send, Xmark } from "../../../primitives/ui-icons"

export type UserInvitationsProps = SettingsViewProps

/**
 * Organization invitations for the signed-in user (from
 * {@link useListUserInvitations}). Always renders the section card; shows an
 * empty state when there are no pending invitations. Mirrors the heroui
 * `UserInvitations`, adapted for React Native: `div`s become `View`s/`Text`s,
 * the dashed row separator is a bordered `View` instead of a CSS `border-b`
 * rule, and the row/skeleton/empty sub-renders (heroui's
 * `UserInvitationRow`/`UserInvitationRowSkeleton`/`UserInvitationsEmpty`) are
 * inlined here rather than split into separate files.
 */
export function UserInvitations({ className, variant }: UserInvitationsProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: invitations, isPending } = useListUserInvitations(
    authClient as OrganizationAuthClient
  )

  return (
    <View className={cn("flex-col gap-3", className)}>
      <Text
        className="shrink text-sm font-semibold text-foreground"
        numberOfLines={1}
      >
        {organizationLocalization.invitations}
      </Text>

      <Card variant={variant}>
        <Card.Content>
          {isPending ? (
            <UserInvitationRowSkeleton />
          ) : !invitations?.length ? (
            <UserInvitationsEmpty />
          ) : (
            invitations?.map((invitation, index) => (
              <View key={invitation.id}>
                {index > 0 && (
                  <View className="-mx-4 my-4 border-b border-dashed border-border" />
                )}

                <UserInvitationRow invitation={invitation} />
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </View>
  )
}

type UserInvitationRowProps = {
  invitation: NonNullable<
    ReturnType<typeof useListUserInvitations>["data"]
  >[number]
}

/**
 * Single invitation row with accept/reject actions for the current user.
 * Mirrors heroui's `UserInvitationRow`.
 */
function UserInvitationRow({ invitation }: UserInvitationRowProps) {
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
      <View className="size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        <Clock width={18} height={18} color={colors.foreground} />
      </View>

      <View className="min-w-0 flex-col">
        <View className="flex-row items-center gap-1.5">
          <Text
            className="shrink text-sm font-medium leading-tight text-foreground"
            numberOfLines={1}
          >
            {invitation.organizationName}
          </Text>

          <Chip className="shrink-0">
            {roles?.[invitation.role] ?? invitation.role}
          </Chip>
        </View>

        <Text className="text-xs text-muted" numberOfLines={1}>
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
          {!isAccepting && (
            <Check width={16} height={16} color={colors.foreground} />
          )}
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
          {!isRejecting && (
            <Xmark width={16} height={16} color={colors.dangerForeground} />
          )}
        </Button>
      </View>
    </View>
  )
}

/**
 * Placeholder row matching {@link UserInvitationRow} while invitations load.
 * Mirrors heroui's `UserInvitationRowSkeleton`.
 */
function UserInvitationRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3">
      <Skeleton className="size-10 shrink-0 rounded-xl" />

      <View className="flex-col gap-1">
        <Skeleton className="h-4 w-40 rounded-lg" />
        <Skeleton className="h-3 w-28 rounded-lg" />
      </View>
    </View>
  )
}

/**
 * Empty state for `UserInvitations`. Mirrors heroui's `UserInvitationsEmpty`.
 */
function UserInvitationsEmpty() {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <EmptyState
      icon={<Send width={18} height={18} />}
      title={organizationLocalization.noInvitations}
      description={organizationLocalization.userInvitationsEmptyDescription}
    />
  )
}
