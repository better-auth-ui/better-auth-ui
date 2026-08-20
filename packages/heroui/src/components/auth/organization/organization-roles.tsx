import type {
  OrganizationAuthClient,
  OrganizationPermissionRegistry
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useCreateRole,
  useDeleteRole,
  useHasPermission,
  useListOrganizationMembers,
  useListRoles,
  useUpdateRole
} from "@better-auth-ui/react/plugins/organization"
import { CirclePlus, Pencil, TrashBin } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Label,
  Spinner,
  Table,
  TextField,
  toast
} from "@heroui/react"
import { type FormEvent, useEffect, useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"

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
  const { authClient } = useAuth()
  const client = authClient as OrganizationAuthClient
  const { dynamicAccessControl, localization } =
    useAuthPlugin(organizationPlugin)
  const roles = useListRoles(client, {
    query: { organizationId },
    enabled: !!organizationId
  })
  const canCreate = useHasPermission(client, {
    organizationId,
    permissions: { ac: ["create"] }
  })
  const canUpdate = useHasPermission(client, {
    organizationId,
    permissions: { ac: ["update"] }
  })
  const canDelete = useHasPermission(client, {
    organizationId,
    permissions: { ac: ["delete"] }
  })
  const deleteRole = useDeleteRole(client, organizationId, {
    onSuccess: () => toast.success(localization.roleDeleted),
    onError: (error) => toast.danger(error.message)
  })
  const [editingRole, setEditingRole] = useState<Role | null>()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{localization.roles}</h2>
          <p className="text-sm text-muted">{localization.rolesDescription}</p>
        </div>
        {canCreate.data?.success && (
          <Button onPress={() => setEditingRole(null)}>
            <CirclePlus />
            {localization.createRole}
          </Button>
        )}
      </div>

      {roles.isLoading ? (
        <Spinner />
      ) : roles.data?.length ? (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={localization.roles}>
              <Table.Header>
                <Table.Column isRowHeader>{localization.roleName}</Table.Column>
                <Table.Column>{localization.permissions}</Table.Column>
                <Table.Column className="text-end">
                  {localization.actions}
                </Table.Column>
              </Table.Header>
              <Table.Body>
                {roles.data.map((role) => (
                  <OrganizationRoleRow
                    key={role.id}
                    authClient={client}
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
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      ) : (
        <Card>
          <Card.Content className="gap-1">
            <p className="text-sm font-medium">{localization.noRoles}</p>
            <p className="text-sm text-muted">
              {localization.noRolesDescription}
            </p>
          </Card.Content>
        </Card>
      )}

      <RoleDialog
        isOpen={editingRole !== undefined}
        onOpenChange={(open) => !open && setEditingRole(undefined)}
        organizationId={organizationId}
        registry={dynamicAccessControl?.permissions ?? {}}
        role={editingRole ?? undefined}
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
    <Table.Row id={role.id}>
      <Table.Cell>{role.role}</Table.Cell>
      <Table.Cell>
        {Object.values(role.permission).reduce(
          (total, actions) => total + actions.length,
          0
        )}
      </Table.Cell>
      <Table.Cell>
        <div className="flex justify-end gap-1">
          {canUpdate && (
            <Button
              isIconOnly
              size="sm"
              variant="tertiary"
              aria-label={localization.editRole}
              onPress={onEdit}
            >
              <Pencil />
            </Button>
          )}
          {canDelete && (
            <Button
              isIconOnly
              size="sm"
              variant="danger-soft"
              aria-label={
                assignedCount > 0
                  ? localization.roleInUse.replace(
                      "{{count}}",
                      String(assignedCount)
                    )
                  : localization.deleteRole
              }
              isDisabled={assignmentUnknown || assignedCount > 0 || deleting}
              onPress={onDelete}
            >
              <TrashBin />
            </Button>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

function RoleDialog({
  isOpen,
  onOpenChange,
  organizationId,
  registry,
  role
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  registry: OrganizationPermissionRegistry
  role?: Role
}) {
  const { authClient, localization: authLocalization } = useAuth()
  const client = authClient as OrganizationAuthClient
  const { localization } = useAuthPlugin(organizationPlugin)
  const [name, setName] = useState("")
  const [permission, setPermission] = useState<Record<string, string[]>>({})
  const createRole = useCreateRole(client, organizationId, {
    onSuccess: () => {
      toast.success(localization.roleCreated)
      onOpenChange(false)
    }
  })
  const updateRole = useUpdateRole(client, organizationId, {
    onSuccess: () => {
      toast.success(localization.roleUpdated)
      onOpenChange(false)
    }
  })

  useEffect(() => {
    if (!isOpen) return
    setName(role?.role ?? "")
    setPermission(role?.permission ?? {})
  }, [isOpen, role])

  const submit = (event: FormEvent<HTMLFormElement>) => {
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
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="max-w-xl">
          <Form onSubmit={submit}>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading>
                {role ? localization.editRole : localization.createRole}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto">
              <p className="text-sm text-muted">
                {localization.rolesDescription}
              </p>
              <TextField isDisabled={pending} isRequired>
                <Label>{localization.roleName}</Label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={localization.roleNamePlaceholder}
                  variant="secondary"
                />
              </TextField>
              <fieldset className="flex flex-col gap-4">
                <legend className="mb-3 text-sm font-medium">
                  {localization.permissions}
                </legend>
                {Object.entries(registry).map(([resource, definition]) => (
                  <div className="flex flex-col gap-2" key={resource}>
                    <p className="text-sm font-medium">
                      {definition.label ?? resource}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(definition.actions).map(
                        ([action, label]) => {
                          const selected =
                            permission[resource]?.includes(action) ?? false
                          return (
                            <Checkbox
                              key={action}
                              isSelected={selected}
                              isDisabled={pending}
                              onChange={(checked) =>
                                setPermission((current) => ({
                                  ...current,
                                  [resource]: checked
                                    ? [...(current[resource] ?? []), action]
                                    : (current[resource] ?? []).filter(
                                        (entry) => entry !== action
                                      )
                                }))
                              }
                              variant="secondary"
                            >
                              <Checkbox.Content>
                                <Checkbox.Control>
                                  <Checkbox.Indicator />
                                </Checkbox.Control>
                                {label}
                              </Checkbox.Content>
                            </Checkbox>
                          )
                        }
                      )}
                    </div>
                  </div>
                ))}
              </fieldset>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={pending}>
                {authLocalization.settings.cancel}
              </Button>
              <Button
                type="submit"
                isDisabled={pending || !name.trim()}
                isPending={pending}
              >
                {pending && <Spinner color="current" size="sm" />}
                {authLocalization.settings.saveChanges}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
