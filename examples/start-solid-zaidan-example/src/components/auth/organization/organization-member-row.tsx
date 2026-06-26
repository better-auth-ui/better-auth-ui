import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import type {
  LeaveOrganizationParams,
  OrganizationAuthClient,
  RemoveMemberParams,
  UpdateMemberRoleParams
} from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useAuth,
  useHasPermission,
  useLeaveOrganization,
  useRemoveMember,
  useSession,
  useUpdateMemberRole
} from "@better-auth-ui/solid"
import { LogOut, Pencil, Trash2 } from "lucide-solid"
import { createSignal, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { UserView } from "@/components/auth/user/user-view"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const removeMember = useRemoveMember(auth.authClient, {
    onSuccess: () => {
      props.onOpenChange(false)
      toast.success(props.localization.memberRemoved)
    }
  })

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.localization.removeMember}</DialogTitle>
          <DialogDescription>
            {props.localization.removeMemberWarning}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            as={Button}
            disabled={removeMember.isPending}
            type="button"
            variant="outline"
          >
            {auth.localization.settings.cancel}
          </DialogClose>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const leaveOrganization = useLeaveOrganization(auth.authClient, {
    onSuccess: () => {
      props.onOpenChange(false)
      toast.success(props.localization.leftOrganization)
      auth.navigate({
        replace: true,
        to: `${auth.basePaths.settings}/${organizationSettingsPath}`
      })
    }
  })

  const handleLeave = () => {
    if (!activeOrganization.data) return

    leaveOrganization.mutate({
      organizationId: activeOrganization.data.id
    } satisfies LeaveOrganizationParams)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.localization.leaveOrganization}</DialogTitle>
          <DialogDescription>
            {props.localization.leaveOrganizationDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            as={Button}
            disabled={leaveOrganization.isPending}
            type="button"
            variant="outline"
          >
            {auth.localization.settings.cancel}
          </DialogClose>
          <Button
            disabled={leaveOrganization.isPending || !activeOrganization.data}
            onClick={handleLeave}
            type="button"
            variant="destructive"
          >
            {props.localization.leaveOrganization}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function OrganizationMemberRow(props: OrganizationMemberRowProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const [removeOpen, setRemoveOpen] = createSignal(false)
  const [leaveOpen, setLeaveOpen] = createSignal(false)
  const session = useSession(auth.authClient)
  const user = () => props.member.user
  const permission = useHasPermission(auth.authClient, {
    permissions: { member: ["update"] }
  })
  const deletePermission = useHasPermission(auth.authClient, {
    permissions: { member: ["delete"] }
  })
  const updateMemberRole = useUpdateMemberRole(auth.authClient, {
    onSuccess: () => toast.success(props.localization.memberRoleUpdated)
  })
  const assignableRoles = () =>
    Object.entries(props.roles).filter(
      ([key]) => props.isOwner || key !== "owner"
    )

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
        {props.roles[props.member.role ?? ""] ?? formatRole(props.member.role)}
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
                    <DropdownMenuItem
                      disabled={props.member.role === role}
                      onSelect={() =>
                        updateMemberRole.mutate({
                          memberId: props.member.id,
                          role: role as UpdateMemberRoleParams["role"]
                        })
                      }
                    >
                      {label}
                    </DropdownMenuItem>
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
