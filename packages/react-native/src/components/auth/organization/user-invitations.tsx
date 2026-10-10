import { UserInvitationRow } from "./user-invitation-row"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListUserInvitations } from "@better-auth-ui/react/plugins/organization"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { Card } from "../../../primitives/card"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { EmptyState } from "../../../primitives/tabs"
import { Send } from "../../../primitives/ui-icons"

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

  const {
    data: invitations,
    isPending,
    error
  } = useListUserInvitations(authClient as OrganizationAuthClient)

  return (
    <Box className={cn("flex-col gap-3", className)}>
      <Txt
        className="shrink text-sm font-semibold text-foreground"
        numberOfLines={1}
      >
        {organizationLocalization.invitations}
      </Txt>

      <Card variant={variant}>
        <Card.Content>
          {isPending ? (
            <UserInvitationRowSkeleton />
          ) : error ? (
            <Txt accessibilityRole="alert">{error.message}</Txt>
          ) : !invitations?.length ? (
            <UserInvitationsEmpty />
          ) : (
            invitations?.map((invitation, index) => (
              <Box key={invitation.id}>
                {index > 0 && (
                  <Box className="-mx-4 my-4 border-b border-dashed border-border" />
                )}

                <UserInvitationRow invitation={invitation} />
              </Box>
            ))
          )}
        </Card.Content>
      </Card>
    </Box>
  )
}

/**
 * Placeholder row matching {@link UserInvitationRow} while invitations load.
 * Mirrors heroui's `UserInvitationRowSkeleton`.
 */
function UserInvitationRowSkeleton() {
  return (
    <Box className="flex-row items-center gap-3">
      <Skeleton className="size-10 shrink-0 rounded-xl" />

      <Box className="flex-col gap-1">
        <Skeleton className="h-4 w-40 rounded-lg" />
        <Skeleton className="h-3 w-28 rounded-lg" />
      </Box>
    </Box>
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
