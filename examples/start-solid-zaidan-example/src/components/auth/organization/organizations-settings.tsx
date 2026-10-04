import { cn } from "cn"
import { Organizations } from "./organizations"
import { UserInvitations } from "./user-invitations"

export type OrganizationsSettingsProps = {
  class?: string
}

export function OrganizationsSettings(props: OrganizationsSettingsProps = {}) {
  return (
    <div class={cn("flex w-full flex-col gap-4 md:gap-6", props.class)}>
      <Organizations />
      <UserInvitations />
    </div>
  )
}
