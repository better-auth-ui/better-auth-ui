import type { OrganizationLocalization } from "@better-auth-ui/core/plugins"
import type { OrganizationAuthClient } from "@better-auth-ui/solid"
import {
  useAcceptInvitation,
  useAuth,
  useRejectInvitation
} from "@better-auth-ui/solid"
import { Check, Clock, X } from "lucide-solid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

type RoleMap = Record<string, string>

type UserInvitation = {
  createdAt?: Date | string | null
  id: string
  organizationName?: string | null
  role?: string | null
}

export type UserInvitationRowProps = {
  invitation: UserInvitation
}

const fallbackRoles: RoleMap = {
  owner: "Owner",
  admin: "Admin",
  member: "Member"
}

const fallbackLocalization = {
  accept: "Accept",
  rejectInvitation: "Reject invitation"
} satisfies Pick<OrganizationLocalization, "accept" | "rejectInvitation">

function formatInvitationDate(createdAt?: Date | string | null) {
  if (!createdAt) return "-"

  const date = createdAt instanceof Date ? createdAt : new Date(createdAt)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  })
}

export function UserInvitationRow(props: UserInvitationRowProps) {
  const auth = useAuth()
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | {
          localization?: Pick<
            OrganizationLocalization,
            "accept" | "rejectInvitation"
          >
          roles?: RoleMap
        }
      | undefined
  const organizationLocalization = () =>
    organizationPluginConfig()?.localization ?? fallbackLocalization
  const roles = () => organizationPluginConfig()?.roles ?? fallbackRoles
  const acceptInvitation = useAcceptInvitation(
    auth.authClient as OrganizationAuthClient
  )
  const rejectInvitation = useRejectInvitation(
    auth.authClient as OrganizationAuthClient
  )
  const isPending = () =>
    acceptInvitation.isPending || rejectInvitation.isPending
  const roleLabel = () =>
    roles()[props.invitation.role ?? ""] ?? props.invitation.role ?? "Member"

  return (
    <Item>
      <ItemMedia variant="icon">
        <Clock />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {props.invitation.organizationName ?? "Organization"}
          <Badge variant="secondary">{roleLabel()}</Badge>
        </ItemTitle>
        <ItemDescription>
          {formatInvitationDate(props.invitation.createdAt)}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          disabled={isPending()}
          onClick={() =>
            acceptInvitation.mutate({ invitationId: props.invitation.id })
          }
          size="sm"
          type="button"
          variant="outline"
        >
          <Check />
          {organizationLocalization().accept}
        </Button>
        <Button
          aria-label={organizationLocalization().rejectInvitation}
          class="text-destructive"
          disabled={isPending()}
          onClick={() =>
            rejectInvitation.mutate({ invitationId: props.invitation.id })
          }
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <X />
        </Button>
      </ItemActions>
    </Item>
  )
}
