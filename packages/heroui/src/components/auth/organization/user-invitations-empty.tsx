import { useAuthPlugin } from "@better-auth-ui/react"
import { Envelope, PaperPlane } from "@gravity-ui/icons"
import { EmptyState } from "@heroui/react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"

/**
 * Empty state for `UserInvitations`
 */
export function UserInvitationsEmpty({
  verificationRequired = false
}: {
  verificationRequired?: boolean
}) {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <EmptyState className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-secondary">
        {verificationRequired ? (
          <Envelope className="size-5" />
        ) : (
          <PaperPlane className="size-5" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">
          {verificationRequired
            ? organizationLocalization.verifyEmailToViewInvitations
            : organizationLocalization.noInvitations}
        </p>

        <span className="text-sm text-muted">
          {verificationRequired
            ? organizationLocalization.verifyEmailToViewInvitationsDescription
            : organizationLocalization.userInvitationsEmptyDescription}
        </span>
      </div>
    </EmptyState>
  )
}
