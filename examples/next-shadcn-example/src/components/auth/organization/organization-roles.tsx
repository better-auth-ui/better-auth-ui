"use client"

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useCreateRole,
  useDeleteRole,
  useHasPermission,
  useListOrganizationMembers,
  useListRoles,
  useUpdateRole
} from "@better-auth-ui/react/plugins/organization"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"

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
import { Spinner } from "@/components/ui/spinner"
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

export function OrganizationRoles({
  organizationId
}: {
  organizationId: string
}) {
  const { authClient } = useAuth<OrganizationAuthClient>()
  const { dynamicAccessControl, localization } =
    useAuthPlugin(organizationPlugin)
  const roles = useListRoles(authClient, {
    query: { organizationId },
    enabled: !!organizationId
  })
  const canCreate = useHasPermission(authClient, {
    organizationId,
    permissions: { ac: ["create"] }
  })
  const canUpdate = useHasPermission(authClient, {
    organizationId,
    permissions: { ac: ["update"] }
  })
  const canDelete = useHasPermission(authClient, {
    organizationId,
    permissions: { ac: ["delete"] }
  })
  const deleteRole = useDeleteRole(authClient, organizationId, {
    onSuccess: () => toast.success(localization.roleDeleted),
    onError: (error) => toast.error(error.message)
  })
  const [editingRole, setEditingRole] = useState<Role | null>()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{localization.roles}</h2>
          <p className="text-sm text-muted-foreground">
            {localization.rolesDescription}
          </p>
        </div>
        {canCreate.data?.success && (
          <Button onClick={() => setEditingRole(null)}>
            <Plus />
            {localization.createRole}
          </Button>
        )}
      </div>

      {roles.isLoading ? (
        <Spinner />
      ) : roles.data?.length ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{localization.roleName}</TableHead>
                  <TableHead>{localization.permissions}</TableHead>
                  <TableHead className="text-right">
                    {localization.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.data.map((role) => (
                  <OrganizationRoleRow
                    key={role.id}
                    authClient={authClient}
                    canDelete={canDelete.data?.success === true}
                    canUpdate={canUpdate.data?.success === true}
                    deleting={deleteRole.isPending}
                    onDelete={() => {
                      if (!window.confirm(localization.deleteRoleDescription))
                        return
                      deleteRole.mutate({
                        roleId: role.id,
                        organizationId
                      })
                    }}
                    onEdit={() => setEditingRole(role)}
                    organizationId={organizationId}
                    role={role}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-sm font-medium">{localization.noRoles}</p>
            <p className="text-sm text-muted-foreground">
              {localization.noRolesDescription}
            </p>
          </CardContent>
        </Card>
      )}

      <RoleDialog
        organizationId={organizationId}
        open={editingRole !== undefined}
        role={editingRole ?? undefined}
        registry={dynamicAccessControl?.permissions ?? {}}
        onOpenChange={(open) => !open && setEditingRole(undefined)}
      />
    </div>
  )
}

function OrganizationRoleRow({
  authClient,
  canDelete,
  canUpdate,
  deleting,
  onDelete,
  onEdit,
  organizationId,
  role
}: {
  authClient: OrganizationAuthClient
  canDelete: boolean
  canUpdate: boolean
  deleting: boolean
  onDelete: () => void
  onEdit: () => void
  organizationId: string
  role: Role
}) {
  const { localization } = useAuthPlugin(organizationPlugin)
  const assignments = useListOrganizationMembers(authClient, {
    query: {
      organizationId,
      filterField: "role",
      filterOperator: "contains",
      filterValue: role.role,
      limit: 1
    },
    enabled: Boolean(organizationId && canDelete)
  })
  const assignedCount =
    assignments.data?.total ?? assignments.data?.members.length ?? 0
  const assignmentUnknown = canDelete && !assignments.data

  return (
    <TableRow>
      <TableCell className="font-medium">{role.role}</TableCell>
      <TableCell>
        {Object.values(role.permission).reduce(
          (total, actions) => total + actions.length,
          0
        )}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          {canUpdate && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onEdit}
              aria-label={localization.editRole}
            >
              <Pencil />
            </Button>
          )}
          {canDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              disabled={assignmentUnknown || assignedCount > 0 || deleting}
              title={
                assignedCount > 0
                  ? localization.roleInUse.replace(
                      "{{count}}",
                      String(assignedCount)
                    )
                  : localization.deleteRole
              }
              onClick={onDelete}
              aria-label={localization.deleteRole}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

function RoleDialog({
  onOpenChange,
  open,
  organizationId,
  registry,
  role
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
  organizationId: string
  registry: Record<string, { label?: string; actions: Record<string, string> }>
  role?: Role
}) {
  const { authClient, localization: authLocalization } =
    useAuth<OrganizationAuthClient>()
  const { localization } = useAuthPlugin(organizationPlugin)
  const [name, setName] = useState("")
  const [permission, setPermission] = useState<Record<string, string[]>>({})
  const createRole = useCreateRole(authClient, organizationId, {
    onSuccess: () => {
      toast.success(localization.roleCreated)
      onOpenChange(false)
    }
  })
  const updateRole = useUpdateRole(authClient, organizationId, {
    onSuccess: () => {
      toast.success(localization.roleUpdated)
      onOpenChange(false)
    }
  })

  useEffect(() => {
    if (!open) return
    setName(role?.role ?? "")
    setPermission(role?.permission ?? {})
  }, [open, role])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const roleName = name.trim()
    if (!roleName) return

    if (role) {
      updateRole.mutate({
        organizationId,
        roleId: role.id,
        data: { roleName, permission }
      })
    } else {
      createRole.mutate({ organizationId, role: roleName, permission })
    }
  }

  const pending = createRole.isPending || updateRole.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <form className="flex flex-col gap-6" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {role ? localization.editRole : localization.createRole}
            </DialogTitle>
            <DialogDescription>
              {localization.rolesDescription}
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="organization-role-name">
              {localization.roleName}
            </FieldLabel>
            <Input
              id="organization-role-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={localization.roleNamePlaceholder}
              disabled={pending}
              required
            />
          </Field>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-sm font-medium">
              {localization.permissions}
            </legend>
            {Object.entries(registry).map(([resource, definition]) => (
              <div className="flex flex-col gap-2" key={resource}>
                <p className="text-sm font-medium">
                  {definition.label ?? resource}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(definition.actions).map(([action, label]) => {
                    const checked =
                      permission[resource]?.includes(action) ?? false
                    return (
                      <label
                        className="flex items-center gap-2 text-sm"
                        htmlFor={`role-permission-${resource}-${action}`}
                        key={action}
                      >
                        <Checkbox
                          id={`role-permission-${resource}-${action}`}
                          checked={checked}
                          disabled={pending}
                          onCheckedChange={(selected) =>
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
                        {label}
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </fieldset>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {authLocalization.settings.cancel}
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending && <Spinner />}
              {authLocalization.settings.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
