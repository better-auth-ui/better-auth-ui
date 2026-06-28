import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import {
  useAcceptInvitation,
  useRejectInvitation
} from "@better-auth-ui/solid/plugins/organization"
import { Check, Clock, X } from "lucide-solid"
import { Button } from "@/components/ui/button"
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
  if (!createdAt) return "—"

  const date = createdAt instanceof Date ? createdAt : new Date(createdAt)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  })
}

export function UserInvitationRow(props: UserInvitationRowProps) {
  const auth = useAuth<OrganizationAuthClient>()
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
  const acceptInvitation = useAcceptInvitation(auth.authClient)
  const rejectInvitation = useRejectInvitation(auth.authClient)
  const isPending = () =>
    acceptInvitation.isPending || rejectInvitation.isPending
  const roleLabel = () =>
    roles()[props.invitation.role ?? ""] ?? props.invitation.role ?? "Member"

  return (
    <div class="flex items-center gap-3">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Clock class="size-4" />
      </div>
      <div class="flex min-w-0 flex-col">
        <div class="flex items-center gap-1.5">
          <span class="truncate font-medium text-sm leading-tight">
            {props.invitation.organizationName ?? "Organization"}
          </span>
          <span class="rounded-md bg-muted px-2 py-1 font-medium text-muted-foreground text-xs">
            {roleLabel()}
          </span>
        </div>
        <span class="truncate text-muted-foreground text-xs">
          {formatInvitationDate(props.invitation.createdAt)}
        </span>
      </div>
      <div class="ml-auto flex shrink-0 items-center gap-2">
        <Button
          disabled={isPending()}
          onClick={() =>
            acceptInvitation.mutate({ invitationId: props.invitation.id })
          }
          size="sm"
          type="button"
          variant="outline"
        >
          <Check class="size-4" />
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
          <X class="size-4" />
        </Button>
      </div>
    </div>
  )
}
