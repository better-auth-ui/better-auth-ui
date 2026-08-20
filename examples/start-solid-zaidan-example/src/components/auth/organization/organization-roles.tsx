import {
  membersWithRole,
  type OrganizationAuthClient,
  type OrganizationPermissionRegistry
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useCreateRole,
  useDeleteRole,
  useHasPermission,
  useListOrganizationMembers,
  useListRoles,
  useUpdateRole
} from "@better-auth-ui/solid/plugins/organization"
import { Pencil, Plus, Trash2 } from "lucide-solid"
import { createEffect, createSignal, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

type Role = {
  id: string
  role: string
  permission: Record<string, string[]>
}

export function OrganizationRoles(props: { organizationId: string }) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const roles = useListRoles(auth.authClient, () => ({
    query: { organizationId: props.organizationId },
    enabled: !!props.organizationId
  }))
  const members = useListOrganizationMembers(auth.authClient, () => ({
    query: { organizationId: props.organizationId },
    enabled: !!props.organizationId
  }))
  const canCreate = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { ac: ["create"] }
  }))
  const canUpdate = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { ac: ["update"] }
  }))
  const canDelete = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { ac: ["delete"] }
  }))
  const deleteRole = useDeleteRole(
    auth.authClient,
    () => props.organizationId,
    () => ({ onSuccess: () => toast.success(config.localization.roleDeleted) })
  )
  const [editingRole, setEditingRole] = createSignal<Role | null | undefined>()

  return (
    <div class="flex flex-col gap-4">
      <div class="flex items-end justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold">{config.localization.roles}</h2>
          <p class="text-sm text-muted-foreground">
            {config.localization.rolesDescription}
          </p>
        </div>
        <Show when={canCreate.data?.success}>
          <Button onClick={() => setEditingRole(null)}>
            <Plus />
            {config.localization.createRole}
          </Button>
        </Show>
      </div>

      <Show
        when={roles.data?.length}
        fallback={
          <Card>
            <CardContent class="flex flex-col gap-1">
              <p class="text-sm font-medium">{config.localization.noRoles}</p>
              <p class="text-sm text-muted-foreground">
                {config.localization.noRolesDescription}
              </p>
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardContent class="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{config.localization.roleName}</TableHead>
                  <TableHead>{config.localization.permissions}</TableHead>
                  <TableHead class="text-end">
                    {config.localization.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <For each={roles.data}>
                  {(role) => {
                    const assignedMembers = () =>
                      membersWithRole(members.data?.members, role.role)
                    return (
                      <TableRow>
                        <TableCell class="font-medium">{role.role}</TableCell>
                        <TableCell>
                          {Object.values(role.permission).reduce(
                            (total, actions) => total + actions.length,
                            0
                          )}
                        </TableCell>
                        <TableCell>
                          <div class="flex justify-end gap-1">
                            <Show when={canUpdate.data?.success}>
                              <Button
                                aria-label={config.localization.editRole}
                                onClick={() => setEditingRole(role)}
                                size="icon-sm"
                                variant="ghost"
                              >
                                <Pencil />
                              </Button>
                            </Show>
                            <Show when={canDelete.data?.success}>
                              <Button
                                aria-label={config.localization.deleteRole}
                                disabled={
                                  assignedMembers().length > 0 ||
                                  deleteRole.isPending
                                }
                                onClick={() => {
                                  if (
                                    !window.confirm(
                                      config.localization.deleteRoleDescription
                                    )
                                  )
                                    return
                                  deleteRole.mutate({
                                    organizationId: props.organizationId,
                                    roleId: role.id
                                  })
                                }}
                                size="icon-sm"
                                title={
                                  assignedMembers().length > 0
                                    ? config.localization.roleInUse.replace(
                                        "{{count}}",
                                        String(assignedMembers().length)
                                      )
                                    : config.localization.deleteRole
                                }
                                variant="ghost"
                              >
                                <Trash2 class="text-destructive" />
                              </Button>
                            </Show>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  }}
                </For>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Show>

      <RoleDialog
        onOpenChange={(open) => !open && setEditingRole(undefined)}
        open={editingRole() !== undefined}
        organizationId={props.organizationId}
        registry={config.dynamicAccessControl?.permissions ?? {}}
        role={editingRole() ?? undefined}
      />
    </div>
  )
}

function RoleDialog(props: {
  onOpenChange: (open: boolean) => void
  open: boolean
  organizationId: string
  registry: OrganizationPermissionRegistry
  role?: Role
}) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const [name, setName] = createSignal("")
  const [permission, setPermission] = createSignal<Record<string, string[]>>({})
  const createRole = useCreateRole(
    auth.authClient,
    () => props.organizationId,
    () => ({
      onSuccess: () => {
        toast.success(config.localization.roleCreated)
        props.onOpenChange(false)
      }
    })
  )
  const updateRole = useUpdateRole(
    auth.authClient,
    () => props.organizationId,
    () => ({
      onSuccess: () => {
        toast.success(config.localization.roleUpdated)
        props.onOpenChange(false)
      }
    })
  )

  createEffect(() => {
    if (!props.open) return
    setName(props.role?.role ?? "")
    setPermission(props.role?.permission ?? {})
  })

  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    const roleName = name().trim()
    if (!roleName) return

    if (props.role) {
      updateRole.mutate({
        organizationId: props.organizationId,
        roleId: props.role.id,
        data: { roleName, permission: permission() }
      })
    } else {
      createRole.mutate({
        organizationId: props.organizationId,
        role: roleName,
        permission: permission()
      })
    }
  }

  const pending = () => createRole.isPending || updateRole.isPending

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <form class="flex flex-col gap-6" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {props.role
                ? config.localization.editRole
                : config.localization.createRole}
            </DialogTitle>
            <DialogDescription>
              {config.localization.rolesDescription}
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel for="organization-role-name">
              {config.localization.roleName}
            </FieldLabel>
            <Input
              disabled={pending()}
              id="organization-role-name"
              onInput={(event) => setName(event.currentTarget.value)}
              placeholder={config.localization.roleNamePlaceholder}
              required
              value={name()}
            />
          </Field>

          <fieldset class="flex flex-col gap-4">
            <legend class="text-sm font-medium">
              {config.localization.permissions}
            </legend>
            <For each={Object.entries(props.registry)}>
              {([resource, definition]) => (
                <div class="flex flex-col gap-2">
                  <p class="text-sm font-medium">
                    {definition.label ?? resource}
                  </p>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <For each={Object.entries(definition.actions)}>
                      {([action, label]) => {
                        const id = `role-permission-${resource}-${action}`
                        return (
                          <Field orientation="horizontal">
                            <Checkbox
                              checked={
                                permission()[resource]?.includes(action) ??
                                false
                              }
                              disabled={pending()}
                              id={id}
                              onChange={(selected) =>
                                setPermission((current) => ({
                                  ...current,
                                  [resource]: selected
                                    ? [...(current[resource] ?? []), action]
                                    : (current[resource] ?? []).filter(
                                        (entry) => entry !== action
                                      )
                                }))
                              }
                            />
                            <FieldLabel for={id}>{label}</FieldLabel>
                          </Field>
                        )
                      }}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </fieldset>

          <DialogFooter>
            <Button
              disabled={pending()}
              onClick={() => props.onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {auth.localization.settings.cancel}
            </Button>
            <Button disabled={pending() || !name().trim()} type="submit">
              {auth.localization.settings.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
