import type { AdditionalFieldFormValue } from "@better-auth-ui/core"
import {
  hasMemberRole,
  memberRoleLabels,
  parseMemberRoles,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useHasPermission,
  useLeaveOrganization,
  useRemoveMember,
  useUpdateMemberRole
} from "@better-auth-ui/react/plugins/organization"
import type { Member, Organization, User } from "better-auth/client"
import { useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { UserView } from "../user/user-view"
import { AdditionalField } from "../additional-field"
import { RolePicker, useOrganizationRoleLabels } from "./role-picker"
import { useAllOrganizationMembers } from "./use-all-members"

export type OrganizationMemberRowProps = {
  member: Member & { user: Partial<User> }
  organization: Organization
  isOwner?: boolean
  visibleFields?: readonly string[]
}
export function OrganizationMemberRow({
  member,
  organization,
  isOwner,
  visibleFields
}: OrganizationMemberRowProps) {
  const { authClient, localization: common } = useAuth()
  const { localization, creatorRole, allowMultipleRoles, modelFields } =
    useAuthPlugin(organizationPlugin)
  const roles = useOrganizationRoleLabels(organization.id)
  const { data: session } = useSession(authClient)
  const client = authClient as OrganizationAuthClient
  const updatePermission = useHasPermission(client, {
    organizationId: organization.id,
    permissions: { member: ["update"] }
  })
  const deletePermission = useHasPermission(client, {
    organizationId: organization.id,
    permissions: { member: ["delete"] }
  })
  const members = useAllOrganizationMembers(organization.id)
  const onlyOwner =
    hasMemberRole(member.role, creatorRole) &&
    (members.isPending ||
      (members.data?.members.filter((item) =>
        hasMemberRole(item.role, creatorRole)
      ).length ?? 0) <= 1)
  const currentUser = session?.user.id === member.userId
  const update = useUpdateMemberRole(client)
  const remove = useRemoveMember(client)
  const leave = useLeaveOrganization(client)
  const [action, setAction] = useState<"role" | "remove" | "leave">()
  const [selected, setSelected] = useState(parseMemberRoles(member.role))
  const assignable = Object.fromEntries(
    Object.entries({
      ...roles,
      ...Object.fromEntries(
        parseMemberRoles(member.role).map((role) => [role, roles[role] ?? role])
      )
    }).filter(
      ([role]) =>
        isOwner || role !== creatorRole || hasMemberRole(member.role, role)
    )
  )
  const busy = update.isPending || remove.isPending || leave.isPending
  const error = update.error || remove.error || leave.error
  const close = () => {
    if (busy) return
    setAction(undefined)
    update.reset()
    remove.reset()
    leave.reset()
  }
  const show = (field: string) =>
    !visibleFields || visibleFields.includes(field)
  const submit = async () => {
    if (busy) return
    // Re-read before removal or demotion, including owners on other pages.
    const fresh = await members.refetch()
    if (fresh.error) return
    const protectedOwner =
      hasMemberRole(member.role, creatorRole) &&
      (fresh.data?.members.filter((item) =>
        hasMemberRole(item.role, creatorRole)
      ).length ?? 0) <= 1
    if (
      protectedOwner &&
      (action !== "role" || !selected.includes(creatorRole))
    ) {
      toast.danger(localization.onlyOwnerActionDisabled)
      return
    }
    if (action === "role" && updatePermission.data?.success && selected.length)
      await update.mutateAsync({
        organizationId: organization.id,
        memberId: member.id,
        role: allowMultipleRoles ? selected : selected[0]!
      })
    else if (action === "leave" && currentUser)
      await leave.mutateAsync({ organizationId: organization.id })
    else if (
      action === "remove" &&
      !currentUser &&
      deletePermission.data?.success
    )
      await remove.mutateAsync({
        organizationId: organization.id,
        memberIdOrEmail: member.id
      })
    else return
    setAction(undefined)
    toast.success(
      action === "role"
        ? localization.memberRoleUpdated
        : action === "leave"
          ? localization.leftOrganization
          : localization.memberRemoved
    )
  }
  return (
    <Box className="gap-3">
      {show("user") ? <UserView user={member.user} /> : null}
      {show("role") ? (
        <Txt>{memberRoleLabels(member.role, roles).join(", ")}</Txt>
      ) : null}
      {modelFields.member
        .filter((field) => show(field.name))
        .map((field) => (
          <AdditionalField
            key={field.name}
            name={field.name}
            field={{ ...field, readOnly: true }}
            value={
              (member as unknown as Record<string, AdditionalFieldFormValue>)[
                field.name
              ] ?? null
            }
            onChange={() => {}}
            onBlur={() => {}}
          />
        ))}
      <Box className="flex-row flex-wrap gap-2">
        {updatePermission.isPending ? (
          <Skeleton className="h-8 w-20" />
        ) : updatePermission.data?.success ? (
          <Button
            size="sm"
            onPress={() => {
              setSelected(parseMemberRoles(member.role))
              setAction("role")
            }}
          >
            {localization.changeMemberRole}
          </Button>
        ) : null}
        {currentUser ? (
          <Button
            size="sm"
            variant="danger"
            isDisabled={onlyOwner}
            onPress={() => setAction("leave")}
          >
            {localization.leaveOrganization}
          </Button>
        ) : deletePermission.isPending ? (
          <Skeleton className="h-8 w-20" />
        ) : deletePermission.data?.success ? (
          <Button
            size="sm"
            variant="danger"
            isDisabled={onlyOwner}
            onPress={() => setAction("remove")}
          >
            {localization.removeMember}
          </Button>
        ) : null}
      </Box>
      {onlyOwner ? (
        <Txt className="text-sm text-muted">
          {localization.onlyOwnerActionDisabled}
        </Txt>
      ) : null}
      <AlertDialog
        isOpen={!!action}
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        <AlertDialog.CloseTrigger />
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {action === "role"
              ? localization.changeMemberRole
              : action === "leave"
                ? localization.leaveOrganization
                : localization.removeMember}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          {action === "role" ? (
            <RolePicker
              roles={assignable}
              value={selected}
              onChange={setSelected}
              multiple={allowMultipleRoles}
              disabled={busy}
            />
          ) : (
            <Txt>
              {action === "leave"
                ? localization.leaveOrganizationDescription
                : localization.removeMemberWarning}
            </Txt>
          )}
          {error ? <Txt accessibilityRole="alert">{error.message}</Txt> : null}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button variant="tertiary" isDisabled={busy} onPress={close}>
            {common.settings.cancel}
          </Button>
          <Button
            isPending={busy}
            isDisabled={
              action === "role" &&
              (!selected.length ||
                (onlyOwner && !selected.includes(creatorRole)))
            }
            variant={action === "role" ? "primary" : "danger"}
            onPress={() => {
              void submit().catch(() => {})
            }}
          >
            {action === "role"
              ? common.settings.saveChanges
              : action === "leave"
                ? localization.leaveOrganization
                : localization.removeMember}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Box>
  )
}
