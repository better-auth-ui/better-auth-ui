import { useAuthPlugin } from "@better-auth-ui/solid"
import { MailWarning, Send } from "lucide-solid"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export function UserInvitationsEmpty(props: {
  verificationRequired?: boolean
}) {
  const config = useAuthPlugin(organizationPlugin)

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {props.verificationRequired ? <MailWarning /> : <Send />}
        </EmptyMedia>
        <EmptyTitle>
          {props.verificationRequired
            ? config.localization.verifyEmailToViewInvitations
            : config.localization.noInvitations}
        </EmptyTitle>
        <EmptyDescription>
          {props.verificationRequired
            ? config.localization.verifyEmailToViewInvitationsDescription
            : config.localization.userInvitationsEmptyDescription}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
