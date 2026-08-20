import {
  type LeaveOrganizationParams,
  memberRoleLabels,
  type OrganizationAuthClient,
  type OrganizationLocalization,
  parseMemberRoles,
  type RemoveMemberParams,
  type UpdateMemberRoleParams
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useSession } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useHasPermission,
  useLeaveOrganization,
  useRemoveMember,
  useUpdateMemberRole
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { TableCell, TableRow } from "@/components/ui/table"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

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
}

type RoleMap = Record<string, string>

type MemberLocalization = Pick<
  OrganizationLocalization,
  | "changeMemberRole"
  | "memberRoleUpdated"
  | "removeMember"
  | "removeMemberWarning"
  | "memberRemoved"
  | "leaveOrganization"
  | "leaveOrganizationDescription"
  | "leftOrganization"
>

export type OrganizationMemberRowProps = {
  isOwner: boolean
  localization: MemberLocalization
  member: OrganizationMember
  roles: RoleMap
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
  const [removeOpen, setRemoveOpen] = createSignal(false)
  const [leaveOpen, setLeaveOpen] = createSignal(false)
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
  const updateMemberRole = useUpdateMemberRole(auth.authClient, () => ({
    onSuccess: () => toast.success(props.localization.memberRoleUpdated)
  }))
  const assignableRoles = () =>
    Object.entries(props.roles).filter(
      ([key]) => props.isOwner || key !== "owner"
    )

  // Better Auth persists multiple roles as one comma-joined string.
  const memberRoles = () => parseMemberRoles(props.member.role)

  const toggleRole = (role: string) => {
    const current = memberRoles()
    const next = current.includes(role)
      ? current.filter((entry) => entry !== role)
      : [...current, role]

    // A member always holds at least one role, so refuse to clear the last one.
    if (next.length === 0) return

    updateMemberRole.mutate({
      memberId: props.member.id,
      organizationId: props.member.organizationId,
      role: next as UpdateMemberRoleParams["role"]
    })
  }

  return (
    <TableRow>
      <TableCell>
        <UserView
          image={user()?.image}
          label={user()?.name ?? user()?.email ?? "Member"}
          secondaryLabel={user()?.email}
        />
      </TableCell>
      <TableCell class="text-sm">
        {memberRoleLabels(props.member.role, props.roles).join(", ") ||
          formatRole(props.member.role)}
      </TableCell>
      <TableCell class="text-end">
        <div class="flex justify-end gap-2">
          <Show when={permission.data?.success}>
            <DropdownMenu>
              <DropdownMenuTrigger
                as={Button}
                aria-label={props.localization.changeMemberRole}
                class="size-8"
                disabled={updateMemberRole.isPending}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Pencil class="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <For each={assignableRoles()}>
                  {([role, label]) => (
                    <DropdownMenuCheckboxItem
                      checked={memberRoles().includes(role)}
                      closeOnSelect={false}
                      disabled={
                        updateMemberRole.isPending ||
                        (memberRoles().includes(role) &&
                          memberRoles().length === 1)
                      }
                      onChange={() => toggleRole(role)}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  )}
                </For>
              </DropdownMenuContent>
            </DropdownMenu>
          </Show>
          <Show
            when={
              deletePermission.data?.success &&
              props.member.userId !== session.data?.user.id
            }
          >
            <Button
              aria-label={props.localization.removeMember}
              onClick={() => setRemoveOpen(true)}
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
