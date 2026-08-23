import { useAuthPlugin } from "@better-auth-ui/react"
import { PaperPlane } from "@gravity-ui/icons"
import { Button, EmptyState } from "@heroui/react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"

export type OrganizationInvitationsEmptyProps = {
  isInvitePending?: boolean
  onInvitePress?: () => void
}

/**
 * Empty state for {@link OrganizationInvitations} — mirrors `ApiKeysEmpty`
 * (icon, title, description) with an "Invite member" call to action.
 */
export function OrganizationInvitationsEmpty({
  isInvitePending,
  onInvitePress
}: OrganizationInvitationsEmptyProps) {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <EmptyState className="flex flex-col items-center gap-4 text-center p-4">
      <PaperPlane className="size-6 text-muted" />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">
          {organizationLocalization.noInvitations}
        </p>

        <span className="text-sm text-muted">
          {organizationLocalization.organizationInvitationsEmptyDescription}
        </span>
      </div>

      {(isInvitePending || onInvitePress) && (
        <Button isDisabled={isInvitePending} size="sm" onPress={onInvitePress}>
          {organizationLocalization.inviteMember}
        </Button>
      )}
    </EmptyState>
  )
}
