import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Send } from "lucide-solid"

export function UserInvitationsEmpty() {
  return (
    <div class="flex flex-col items-center gap-4 p-4 text-center">
      <div class="flex size-12 items-center justify-center rounded-full bg-muted">
        <Send class="size-5" />
      </div>
      <div class="flex flex-col gap-2">
        <p class="font-semibold text-foreground text-sm">
          {organizationLocalization.noInvitations}
        </p>
        <span class="text-muted-foreground text-sm">
          {organizationLocalization.userInvitationsEmptyDescription}
        </span>
      </div>
    </div>
  )
}
