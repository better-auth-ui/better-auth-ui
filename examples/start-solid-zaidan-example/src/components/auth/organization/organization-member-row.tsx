import { formatAdditionalFieldValue } from "@better-auth-ui/core"
import {
  hasMemberRole,
  type LeaveOrganizationParams,
  memberRoleLabels,
  type OrganizationAuthClient,
  type OrganizationLocalization,
  type OrganizationTeamsAuthClient,
  type RemoveMemberParams
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useHasPermission,
  useLeaveOrganization,
  useListUserTeams,
  useRemoveMember
} from "@better-auth-ui/solid/plugins/organization"
import { LogOut, Pencil, Trash2 } from "lucide-solid"
import { createSignal, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { UserView } from "@/components/auth/user/user-view"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { EditMemberRolesDialog } from "./edit-member-roles-dialog"
import {
  type OrganizationSelectableRow,
  OrganizationTableSelectRow
} from "./organization-table-selection"

type OrganizationMember = {
  id: string
  organizationId: string
  role?: string | null
  userId?: string | null
  user?: {
    email?: string | null
    image?: string | null
    name?: string | null
  } | null
  [key: string]: unknown
}

type RoleMap = Record<string, string>

type MemberLocalization = Pick<
  OrganizationLocalization,
  | "changeMemberRole"
  | "changeMemberRoleDescription"
  | "memberRoleUpdated"
  | "removeMember"
  | "removeMemberWarning"
  | "memberRemoved"
  | "leaveOrganization"
  | "leaveOrganizationDescription"
  | "leftOrganization"
  | "onlyOwnerActionDisabled"
  | "noTeams"
  | "selectRow"
>

export type OrganizationMemberRowProps = {
  isOwner: boolean
  localization: MemberLocalization
  member: OrganizationMember
  ownerCount?: number
  roles: RoleMap
  selectableRow?: OrganizationSelectableRow
  showRole?: boolean
  showTeams?: boolean
}

function formatRole(role?: string | null) {
  if (!role) return "Member"

  return role.charAt(0).toUpperCase() + role.slice(1)
}

function RemoveMemberDialog(props: {
  localization: Pick<
    OrganizationLocalization,
    "removeMember" | "removeMemberWarning" | "memberRemoved"
  >
  member: OrganizationMember
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const auth = useAuth<OrganizationAuthClient>()
  const removeMember = useRemoveMember(auth.authClient, () => ({
    onSuccess: () => {
      props.onOpenChange(false)
      toast.success(props.localization.memberRemoved)
    }
  }))

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.localization.removeMember}</AlertDialogTitle>
          <AlertDialogDescription>
            {props.localization.removeMemberWarning}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removeMember.isPending} type="button">
            {auth.localization.settings.cancel}
          </AlertDialogCancel>
          <Button
            disabled={removeMember.isPending}
            onClick={() =>
              removeMember.mutate({
                memberIdOrEmail: props.member.id,
                organizationId: props.member.organizationId
              } satisfies RemoveMemberParams)
            }
            type="button"
            variant="destructive"
          >
            {props.localization.removeMember}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function LeaveOrganizationDialog(props: {
  localization: Pick<
    OrganizationLocalization,
    "leaveOrganization" | "leaveOrganizationDescription" | "leftOrganization"
  >
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const auth = useAuth<OrganizationAuthClient>()
  const activeOrganization = useActiveOrganization(auth.authClient)
  const organizationSettingsPath =
    organizationPlugin().viewPaths.settings?.organizations ?? "organizations"
  const leaveOrganization = useLeaveOrganization(auth.authClient, () => ({
    onSuccess: () => {
      props.onOpenChange(false)
      toast.success(props.localization.leftOrganization)
      auth.navigate({
        replace: true,
        to: `${auth.basePaths.settings}/${organizationSettingsPath}`
      })
    }
  }))

  const handleLeave = () => {
    if (!activeOrganization.data) return

    leaveOrganization.mutate({
      organizationId: activeOrganization.data.id
    } satisfies LeaveOrganizationParams)
  }

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {props.localization.leaveOrganization}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {props.localization.leaveOrganizationDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={leaveOrganization.isPending}
            type="button"
          >
            {auth.localization.settings.cancel}
          </AlertDialogCancel>
          <Button
            disabled={leaveOrganization.isPending || !activeOrganization.data}
            onClick={handleLeave}
            type="button"
            variant="destructive"
          >
            {props.localization.leaveOrganization}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function OrganizationMemberRow(props: OrganizationMemberRowProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const [removeOpen, setRemoveOpen] = createSignal(false)
  const [leaveOpen, setLeaveOpen] = createSignal(false)
  const [roleEditorOpen, setRoleEditorOpen] = createSignal(false)
  const session = useSession(auth.authClient)
  const user = () => props.member.user
  const permission = useHasPermission(auth.authClient, () => ({
    organizationId: props.member.organizationId,
    permissions: { member: ["update"] }
  }))
  const deletePermission = useHasPermission(auth.authClient, () => ({
    organizationId: props.member.organizationId,
    permissions: { member: ["delete"] }
  }))
  const memberTeams = useListUserTeams(
    auth.authClient as OrganizationTeamsAuthClient,
    () => ({
      query: {
        organizationId: props.member.organizationId,
        ...(props.member.userId ? { userId: props.member.userId } : {})
      },
      enabled: props.showTeams === true && Boolean(props.member.userId)
    })
  )
  const assignableRoles = () =>
    Object.entries(props.roles).filter(
      ([key]) => props.isOwner || key !== config.creatorRole
    )

  const targetIsOwner = () =>
    hasMemberRole(props.member.role, config.creatorRole)
  const canManageTarget = () => props.isOwner || !targetIsOwner()
  const onlyOwnerActionDisabled = () =>
    targetIsOwner() && (props.ownerCount === undefined || props.ownerCount <= 1)
  const teamNames = () => memberTeams.data?.map((team) => team.name).join(", ")

  return (
    <TableRow>
      <Show when={props.selectableRow}>
        {(row) => (
          <TableCell>
            <OrganizationTableSelectRow
              localization={props.localization}
              row={row()}
            />
          </TableCell>
        )}
      </Show>
      <TableCell>
        <div class="flex flex-col gap-1">
          <UserView
            image={user()?.image}
            label={user()?.name ?? user()?.email ?? "Member"}
            secondaryLabel={user()?.email}
          />
          <For each={config.modelFields.member}>
            {(field) => {
              const value = () =>
                formatAdditionalFieldValue(props.member[field.name])
              return (
                <Show when={value()}>
                  {(resolved) => (
                    <span class="text-muted-foreground text-xs">
                      {field.label}: {resolved()}
                    </span>
                  )}
                </Show>
              )
            }}
          </For>
        </div>
      </TableCell>
      <Show when={props.showRole !== false}>
        <TableCell class="text-sm">
          {memberRoleLabels(props.member.role, props.roles).join(", ") ||
            formatRole(props.member.role)}
        </TableCell>
      </Show>
      <Show when={props.showTeams}>
        <TableCell class="text-sm">
          <Show
            when={!memberTeams.isPending}
            fallback={<Skeleton class="h-4 w-24 rounded-md" />}
          >
            <Show when={!memberTeams.isError}>
              <span
                classList={{
                  "text-muted-foreground": !teamNames()
                }}
              >
                {teamNames() || props.localization.noTeams}
              </span>
            </Show>
          </Show>
        </TableCell>
      </Show>
      <TableCell class="text-end">
        <div class="flex justify-end gap-2">
          <Show when={canManageTarget() && permission.isPending}>
            <Button
              aria-label={props.localization.changeMemberRole}
              class="size-8"
              disabled
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Pencil class="size-4" />
            </Button>
          </Show>
          <Show when={canManageTarget() && permission.data?.success}>
            <Button
              aria-label={props.localization.changeMemberRole}
              class="size-8"
              onClick={() => setRoleEditorOpen(true)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Pencil class="size-4" />
            </Button>
          </Show>
          <Show when={canManageTarget() && permission.data?.success}>
            <EditMemberRolesDialog
              localization={props.localization}
              member={{
                id: props.member.id,
                organizationId: props.member.organizationId,
                role: props.member.role
              }}
              onOpenChange={setRoleEditorOpen}
              open={roleEditorOpen()}
              protectedRole={config.creatorRole}
              protectedRoleRemovalDisabled={onlyOwnerActionDisabled()}
              roles={assignableRoles()}
            />
          </Show>
          <Show
            when={
              deletePermission.data?.success &&
              canManageTarget() &&
              props.member.userId !== session.data?.user.id
            }
          >
            <Button
              aria-label={props.localization.removeMember}
              disabled={onlyOwnerActionDisabled()}
              title={
                onlyOwnerActionDisabled()
                  ? props.localization.onlyOwnerActionDisabled
                  : undefined
              }
              onClick={() => setRemoveOpen(true)}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <Trash2 class="size-4 text-destructive" />
            </Button>
          </Show>
          <Show
            when={
              deletePermission.isPending &&
              canManageTarget() &&
              props.member.userId !== session.data?.user.id
            }
          >
            <Button
              aria-label={props.localization.removeMember}
              disabled
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <Trash2 class="size-4 text-destructive" />
            </Button>
          </Show>
          <Show when={props.member.userId === session.data?.user.id}>
            <Button
              aria-label={props.localization.leaveOrganization}
              disabled={onlyOwnerActionDisabled()}
              title={
                onlyOwnerActionDisabled()
                  ? props.localization.onlyOwnerActionDisabled
                  : undefined
              }
              onClick={() => setLeaveOpen(true)}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <LogOut class="size-4 text-destructive" />
            </Button>
          </Show>
        </div>
        <RemoveMemberDialog
          localization={props.localization}
          member={props.member}
          onOpenChange={setRemoveOpen}
          open={removeOpen()}
        />
        <LeaveOrganizationDialog
          localization={props.localization}
          onOpenChange={setLeaveOpen}
          open={leaveOpen()}
        />
      </TableCell>
    </TableRow>
  )
}
