"use client"

import {
  type AdditionalFields,
  fieldsWithModelValues,
  parseAdditionalFieldValues
} from "@better-auth-ui/core"
import type { OrganizationRolesAuthClient } from "@better-auth-ui/core/plugins/organization"
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
import { AdditionalField } from "../additional-field"

type Role = {
  id: string
  role: string
  permission: Record<string, string[]>
  [key: string]: unknown
}

export function OrganizationRoles({
  organizationId
}: {
  organizationId: string
}) {
  const { authClient } = useAuth<OrganizationRolesAuthClient>()
  const { dynamicAccessControl, localization, modelFields } =
    useAuthPlugin(organizationPlugin)
  const canRead = useHasPermission(authClient, {
    organizationId,
    permissions: { ac: ["read"] }
  })
  const roles = useListRoles(authClient, {
    query: { organizationId },
    enabled: !!organizationId && canRead.data?.success === true
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
        {(canCreate.isPending || canCreate.data?.success) && (
          <Button
            disabled={canCreate.isPending}
            onClick={() => setEditingRole(null)}
          >
            <Plus />
            {localization.createRole}
          </Button>
        )}
      </div>

      {canRead.isPending || roles.isLoading ? (
        <Spinner />
      ) : !canRead.data?.success ? null : roles.data?.length ? (
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
                    canDeletePending={canDelete.isPending}
                    canUpdate={canUpdate.data?.success === true}
                    canUpdatePending={canUpdate.isPending}
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
        roleFields={modelFields.role}
        onOpenChange={(open) => !open && setEditingRole(undefined)}
      />
    </div>
  )
}

function OrganizationRoleRow({
  authClient,
  canDelete,
  canDeletePending,
  canUpdate,
  canUpdatePending,
  deleting,
  onDelete,
  onEdit,
  organizationId,
  role
}: {
  authClient: OrganizationRolesAuthClient
  canDelete: boolean
  canDeletePending: boolean
  canUpdate: boolean
  canUpdatePending: boolean
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
          {canUpdatePending && (
            <Button
              aria-label={localization.editRole}
              disabled
              size="icon"
              variant="ghost"
            >
              <Pencil />
            </Button>
          )}
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
          {canDeletePending && (
            <Button
              aria-label={localization.deleteRole}
              className="text-destructive"
              disabled
              size="icon"
              variant="ghost"
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
  role,
  roleFields
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
  organizationId: string
  registry: Record<string, { label?: string; actions: Record<string, string> }>
  role?: Role
  roleFields: AdditionalFields
}) {
  const { authClient, localization: authLocalization } =
    useAuth<OrganizationRolesAuthClient>()
  const { localization } = useAuthPlugin(organizationPlugin)
  const [name, setName] = useState("")
  const [permission, setPermission] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const roleName = name.trim()
    if (!roleName) return

    setIsSubmitting(true)
    try {
      if (Object.values(permission).some((actions) => actions.length > 0)) {
        const access = await authClient.organization.hasPermission({
          organizationId,
          permissions: permission as Parameters<
            OrganizationRolesAuthClient["organization"]["hasPermission"]
          >[0]["permissions"]
        })

        if (access.error || !access.data?.success) {
          toast.error(localization.permissionsLimitedDescription)
          setIsSubmitting(false)
          return
        }
      }

      const additionalFields = await parseAdditionalFieldValues(
        roleFields,
        new FormData(event.currentTarget)
      )
      if (role) {
        updateRole.mutate(
          {
            organizationId,
            roleId: role.id,
            data: { ...additionalFields, roleName, permission }
          },
          { onSettled: () => setIsSubmitting(false) }
        )
      } else {
        createRole.mutate(
          {
            organizationId,
            role: roleName,
            permission,
            additionalFields
          },
          { onSettled: () => setIsSubmitting(false) }
        )
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
      setIsSubmitting(false)
    }
  }

  const pending = createRole.isPending || updateRole.isPending || isSubmitting

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

          {fieldsWithModelValues(roleFields, role ?? {}).map((field) => (
            <AdditionalField
              key={field.name}
              field={field}
              name={field.name}
              isPending={pending}
              optionalLabel={authLocalization.settings.optional}
            />
          ))}

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
                  {Object.entries(definition.actions).map(([action, label]) => (
                    <RolePermissionCheckbox
                      action={action}
                      checked={permission[resource]?.includes(action) ?? false}
                      key={action}
                      label={label}
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
                      organizationId={organizationId}
                      pending={pending}
                      resource={resource}
                    />
                  ))}
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

function RolePermissionCheckbox({
  action,
  checked,
  label,
  onCheckedChange,
  organizationId,
  pending,
  resource
}: {
  action: string
  checked: boolean
  label: string
  onCheckedChange: (checked: boolean) => void
  organizationId: string
  pending: boolean
  resource: string
}) {
  const { authClient } = useAuth<OrganizationRolesAuthClient>()
  const canAssign = useHasPermission(authClient, {
    organizationId,
    permissions: { [resource]: [action] } as Parameters<
      OrganizationRolesAuthClient["organization"]["hasPermission"]
    >[0]["permissions"]
  })
  const id = `role-permission-${resource}-${action}`
  const disabled =
    pending || canAssign.isPending || (!checked && !canAssign.data?.success)

  return (
    <label
      className="flex items-center gap-2 text-sm"
      data-disabled={disabled || undefined}
      htmlFor={id}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        id={id}
        onCheckedChange={(selected) => onCheckedChange(selected === true)}
      />
      {label}
    </label>
  )
}
