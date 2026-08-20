import { cn } from "@/lib/utils"
import { OrganizationInvitations } from "./organization-invitations"
import { OrganizationMembers } from "./organization-members"

export type OrganizationPeopleProps = {
  class?: string
  /** Organization to query. The current organization is used when omitted. */
  organizationId?: string
}

export function OrganizationPeople(props: OrganizationPeopleProps) {
  return (
    <div class={cn("grid gap-4 md:gap-6", props.class)}>
      <OrganizationMembers organizationId={props.organizationId} />
      <OrganizationInvitations />
    </div>
  )
}
