import { organizationLocalization } from "@better-auth-ui/core/plugins"
import { Send } from "lucide-solid"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"

export function UserInvitationsEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Send />
        </EmptyMedia>
        <EmptyTitle>{organizationLocalization.noInvitations}</EmptyTitle>
        <EmptyDescription>
          {organizationLocalization.userInvitationsEmptyDescription}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
