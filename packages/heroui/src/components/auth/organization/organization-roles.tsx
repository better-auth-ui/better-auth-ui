import {
  type AdditionalFields,
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateStringLength
} from "@better-auth-ui/core"
import type {
  OrganizationPermissionRegistry,
  OrganizationRolesAuthClient
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
import { CirclePlus, Funnel, Pencil, TrashBin, Xmark } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Card,
  Checkbox,
  Chip,
  Dropdown,
  Input,
  Label,
  SearchField,
  Spinner,
  Table,
  TextField,
  toast
} from "@heroui/react"
import { useEffect, useMemo, useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm
} from "../auth-form"
import { getHeroUISortDescriptor } from "../table-bridge"
import { OrganizationSortableTableHeader } from "./organization-sortable-table-header"
import {
  createOrganizationColumnHelper,
  ORGANIZATION_TABLE_PAGE_SIZE,
  useOrganizationTable
} from "./organization-table"
import { OrganizationTableBulkAction } from "./organization-table-bulk-action"
import { OrganizationTablePagination } from "./organization-table-pagination"
import {
  type OrganizationSelectableRow,
  OrganizationTableSelectAll,
  OrganizationTableSelectRow
} from "./organization-table-selection"
import { useOrganizationTableState } from "./organization-table-state"
import { OrganizationTableViewOptions } from "./organization-table-view-options"

type Role = {
  id: string
  role: string
  permission: Record<string, string[]>
  [key: string]: unknown
}

const roleColumnHelper = createOrganizationColumnHelper<Role>()
const roleColumns = roleColumnHelper.columns([
  roleColumnHelper.accessor("role", {
    enableHiding: false,
    filterFn: "includesString"
  }),
  roleColumnHelper.accessor(
    (role) =>
      Object.values(role.permission).reduce(
        (total, actions) => total + actions.length,
        0
      ),
    { id: "permissions", enableGlobalFilter: false }
  ),
  roleColumnHelper.accessor((role) => Object.keys(role.permission), {
    id: "permissionResources",
    enableGlobalFilter: false,
    enableHiding: false,
    enableSorting: false,
    filterFn: (row, columnId, value) =>
      row.getValue<string[]>(columnId).includes(String(value))
  })
])
const ROLE_COLUMN_IDS = ["role", "permissions", "permissionResources"] as const
const EMPTY_ROLES: Role[] = []

export function OrganizationRoles({
  organizationId
}: {
  organizationId: string
}) {
  const { authClient, localization: authLocalization } = useAuth()
  const client = authClient as OrganizationRolesAuthClient
  const { dynamicAccessControl, localization, modelFields } =
    useAuthPlugin(organizationPlugin)
  const canRead = useHasPermission(client, {
    organizationId,
    permissions: { ac: ["read"] }
  })
  const roles = useListRoles(client, {
    query: { organizationId },
    enabled: !!organizationId && canRead.data?.success === true
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
  const [editingRole, setEditingRole] = useState<Role | null>()
  const tableState = useOrganizationTableState(
    "organizationRoles",
    ORGANIZATION_TABLE_PAGE_SIZE,
    ROLE_COLUMN_IDS
  )
  const { columnVisibility, globalFilter, pagination } = tableState
  const table = useOrganizationTable({
    atoms: tableState.atoms,
    columns: roleColumns,
    data: roles.data ?? EMPTY_ROLES,
    enableRowSelection: canDelete.data?.success === true,
    globalFilterFn: (row, _columnId, value) => {
      const query = String(value).toLowerCase()
      return (
        row.original.role.toLowerCase().includes(query) ||
        Object.entries(row.original.permission).some(
          ([resource, actions]) =>
            resource.toLowerCase().includes(query) ||
            actions.some((action) => action.toLowerCase().includes(query))
        )
      )
    },
    getRowId: (role) => role.id,
    state: {
      columnVisibility: { ...columnVisibility, permissionResources: false }
    },
    onColumnVisibilityChange: tableState.setColumnVisibility
  })
  const deleteRoles = useDeleteRole(client, organizationId)
  const permissionFilter = String(
    table.getColumn("permissionResources")?.getFilterValue() ?? "all"
  )
  const permissionFacetRows = table
    .getColumn("permissionResources")
    ?.getFacetedRowModel().flatRows
  const permissionResources = Array.from(
    new Set(
      (roles.data ?? EMPTY_ROLES).flatMap((role) =>
        Object.keys(role.permission)
      )
    )
  ).sort()
  const selectedRoles = table.getSelectedRowModel().rows
  const showSelection = canDelete.data?.success === true

  async function deleteSelectedRoles() {
    const results = await Promise.allSettled(
      selectedRoles.map((row) =>
        deleteRoles.mutateAsync({ roleId: row.original.id, organizationId })
      )
    )
    const deletedCount = results.filter(
      (result) => result.status === "fulfilled"
    ).length
    const failed = results.find((result) => result.status === "rejected")
    if (deletedCount > 0)
      toast.success(
        localization.rolesDeleted.replace("{{count}}", String(deletedCount))
      )
    if (failed?.status === "rejected")
      toast.danger(
        failed.reason instanceof Error
          ? failed.reason.message
          : String(failed.reason)
      )
    table.resetRowSelection(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{localization.roles}</h2>
          <p className="text-sm text-muted">{localization.rolesDescription}</p>
        </div>
        {(canCreate.isPending || canCreate.data?.success) && (
          <Button
            isDisabled={canCreate.isPending}
            onPress={() => setEditingRole(null)}
          >
            <CirclePlus />
            {localization.createRole}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          className="min-w-0"
          aria-label={localization.search}
          value={globalFilter}
          onChange={table.setGlobalFilter}
          isDisabled={roles.isLoading}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              placeholder={localization.search}
              className="sm:w-[200px]"
            />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <Dropdown>
          <Button size="sm" variant="secondary" isDisabled={roles.isLoading}>
            <Funnel />
            {localization.permissions}
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu
              selectionMode="single"
              selectedKeys={new Set([permissionFilter])}
              onSelectionChange={(keys) => {
                const value = [...keys][0] as string | undefined
                table
                  .getColumn("permissionResources")
                  ?.setFilterValue(
                    !value || value === "all" ? undefined : value
                  )
              }}
            >
              <Dropdown.Item id="all" textValue={localization.all}>
                <Label>{localization.all}</Label>
                <Dropdown.ItemIndicator />
              </Dropdown.Item>
              {permissionResources.map((resource) => (
                <Dropdown.Item
                  id={resource}
                  key={resource}
                  textValue={resource}
                >
                  <Label>
                    {dynamicAccessControl?.permissions[resource]?.label ??
                      resource}{" "}
                    (
                    {permissionFacetRows?.filter((row) =>
                      Object.hasOwn(row.original.permission, resource)
                    ).length ?? 0}
                    )
                  </Label>
                  <Dropdown.ItemIndicator />
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>

        <div className="ms-auto">
          <OrganizationTableViewOptions
            columns={[
              {
                id: "permissions",
                label: localization.permissions,
                visible: table.getColumn("permissions")?.getIsVisible() ?? true,
                onVisibleChange: (visible) =>
                  table.getColumn("permissions")?.toggleVisibility(visible)
              }
            ]}
            disabled={roles.isLoading}
            localization={localization}
          />
        </div>
      </div>

      {permissionFilter !== "all" && (
        <Chip size="sm" variant="secondary" className="w-fit">
          <Chip.Label>
            {dynamicAccessControl?.permissions[permissionFilter]?.label ??
              permissionFilter}
          </Chip.Label>
          <button
            type="button"
            aria-label={localization.clear}
            className="text-muted hover:text-foreground inline-flex cursor-pointer items-center"
            onClick={() =>
              table.getColumn("permissionResources")?.setFilterValue(undefined)
            }
          >
            <Xmark className="size-3" />
          </button>
        </Chip>
      )}

      <OrganizationTableBulkAction
        cancelLabel={authLocalization.settings.cancel}
        confirmLabel={localization.deleteSelectedRoles}
        description={localization.deleteSelectedRolesDescription}
        onConfirm={deleteSelectedRoles}
        pending={deleteRoles.isPending}
        selectedCount={selectedRoles.length}
        title={localization.deleteSelectedRoles}
        localization={localization}
      />

      {canRead.isPending || roles.isLoading ? (
        <Spinner />
      ) : !canRead.data?.success ? null : roles.data?.length ? (
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label={localization.roles}
              sortDescriptor={getHeroUISortDescriptor(tableState.sorting)}
            >
              <Table.Header>
                {showSelection && (
                  <Table.Column>
                    <OrganizationTableSelectAll
                      allSelected={table.getIsAllPageRowsSelected()}
                      disabled={roles.isLoading}
                      localization={localization}
                      onCheckedChange={(checked) =>
                        table.toggleAllPageRowsSelected(checked)
                      }
                      someSelected={table.getIsSomePageRowsSelected()}
                    />
                  </Table.Column>
                )}
                <Table.Column allowsSorting id="role" isRowHeader>
                  <OrganizationSortableTableHeader
                    column={table.getColumn("role")}
                  >
                    {localization.roleName}
                  </OrganizationSortableTableHeader>
                </Table.Column>
                {table.getColumn("permissions")?.getIsVisible() && (
                  <Table.Column allowsSorting id="permissions">
                    <OrganizationSortableTableHeader
                      column={table.getColumn("permissions")}
                    >
                      {localization.permissions}
                    </OrganizationSortableTableHeader>
                  </Table.Column>
                )}
                <Table.Column className="text-end">
                  {localization.actions}
                </Table.Column>
              </Table.Header>
              <Table.Body>
                {table.getRowModel().rows.map((row) => (
                  <OrganizationRoleRow
                    key={row.original.id}
                    authClient={client}
                    canDelete={canDelete.data?.success === true}
                    canDeletePending={canDelete.isPending}
                    canUpdate={canUpdate.data?.success === true}
                    canUpdatePending={canUpdate.isPending}
                    onEdit={() => setEditingRole(row.original)}
                    organizationId={organizationId}
                    role={row.original}
                    selectableRow={showSelection ? row : undefined}
                    showPermissions={
                      table.getColumn("permissions")?.getIsVisible() === true
                    }
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

      <OrganizationTablePagination
        canNextPage={table.getCanNextPage()}
        canPreviousPage={table.getCanPreviousPage()}
        disabled={roles.isLoading}
        localization={localization}
        onFirstPage={() => table.firstPage()}
        onLastPage={() => table.lastPage()}
        onNextPage={() => table.nextPage()}
        onPageSizeChange={(size) => table.setPageSize(size)}
        onPreviousPage={() => table.previousPage()}
        pageCount={table.getPageCount()}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        rowCount={table.getRowCount()}
        visibleRowCount={table.getRowModel().rows.length}
      />

      <RoleDialog
        isOpen={editingRole !== undefined}
        onOpenChange={(open) => !open && setEditingRole(undefined)}
        organizationId={organizationId}
        registry={dynamicAccessControl?.permissions ?? {}}
        roleFields={modelFields.role}
        role={editingRole ?? undefined}
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
  onEdit,
  organizationId,
  role,
  selectableRow,
  showPermissions
}: {
  authClient: OrganizationRolesAuthClient
  canDelete: boolean
  canDeletePending: boolean
  canUpdate: boolean
  canUpdatePending: boolean
  onEdit: () => void
  organizationId: string
  role: Role
  selectableRow?: OrganizationSelectableRow<Role>
  showPermissions: boolean
}) {
  const { localization: authLocalization } = useAuth()
  const { localization } = useAuthPlugin(organizationPlugin)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteRole = useDeleteRole(authClient, organizationId, {
    onSuccess: () => {
      setDeleteOpen(false)
      toast.success(localization.roleDeleted)
    },
    onError: (error) => toast.danger(error.message)
  })
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
  const deleteDisabled =
    assignmentUnknown || assignedCount > 0 || deleteRole.isPending

  return (
    <Table.Row id={role.id}>
      {selectableRow && (
        <Table.Cell>
          <OrganizationTableSelectRow
            localization={localization}
            row={selectableRow}
          />
        </Table.Cell>
      )}
      <Table.Cell>{role.role}</Table.Cell>
      {showPermissions && (
        <Table.Cell>
          {Object.values(role.permission).reduce(
            (total, actions) => total + actions.length,
            0
          )}
        </Table.Cell>
      )}
      <Table.Cell>
        <div className="flex justify-end gap-1">
          {canUpdatePending && (
            <Button
              aria-label={localization.editRole}
              isDisabled
              isIconOnly
              size="sm"
              variant="tertiary"
            >
              <Pencil />
            </Button>
          )}
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
            <AlertDialog
              isOpen={deleteOpen}
              onOpenChange={(open) => {
                if (!deleteRole.isPending) setDeleteOpen(open)
              }}
            >
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
                isDisabled={deleteDisabled}
              >
                <TrashBin />
              </Button>
              <AlertDialog.Backdrop
                isKeyboardDismissDisabled={deleteRole.isPending}
              >
                <AlertDialog.Container>
                  <AlertDialog.Dialog>
                    <AlertDialog.CloseTrigger
                      isDisabled={deleteRole.isPending}
                    />
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="danger">
                        <TrashBin />
                      </AlertDialog.Icon>
                      <AlertDialog.Heading>
                        {localization.deleteRole}
                      </AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body className="flex flex-col gap-4">
                      <p className="text-sm text-muted">
                        {localization.deleteRoleDescription}
                      </p>
                      <p className="break-words text-sm font-medium">
                        {role.role}
                      </p>
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button
                        autoFocus
                        slot="close"
                        variant="tertiary"
                        isDisabled={deleteRole.isPending}
                      >
                        {authLocalization.settings.cancel}
                      </Button>
                      <Button
                        variant="danger"
                        isDisabled={deleteDisabled}
                        isPending={deleteRole.isPending}
                        onPress={() =>
                          deleteRole.mutate({ roleId: role.id, organizationId })
                        }
                      >
                        {deleteRole.isPending && (
                          <Spinner color="current" size="sm" />
                        )}
                        {localization.deleteRole}
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          )}
          {canDeletePending && (
            <Button
              aria-label={localization.deleteRole}
              isDisabled
              isIconOnly
              size="sm"
              variant="danger-soft"
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
  role,
  roleFields
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  registry: OrganizationPermissionRegistry
  role?: Role
  roleFields: AdditionalFields
}) {
  const { authClient, localization: authLocalization } = useAuth()
  const client = authClient as OrganizationRolesAuthClient
  const { localization } = useAuthPlugin(organizationPlugin)
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

  const configuredRoleFields = useMemo(
    () => fieldsWithModelValues(roleFields, role ?? {}),
    [role, roleFields]
  )
  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(configuredRoleFields),
      name: role?.role ?? "",
      permission: role?.permission ?? ({} as Record<string, string[]>)
    },
    onSubmit: async ({ value }) => {
      const roleName = value.name.trim()
      if (!roleName) return

      try {
        if (
          Object.values(value.permission).some((actions) => actions.length > 0)
        ) {
          const access = await client.organization.hasPermission({
            organizationId,
            permissions: value.permission as Parameters<
              OrganizationRolesAuthClient["organization"]["hasPermission"]
            >[0]["permissions"]
          })

          if (access.error || !access.data?.success) {
            toast.danger(localization.permissionsLimitedDescription)
            return
          }
        }

        const additionalFields = getAdditionalFieldSubmitValues(
          configuredRoleFields,
          value.additionalFields
        )
        if (role) {
          await updateRole.mutateAsync({
            organizationId,
            roleId: role.id,
            data: {
              ...additionalFields,
              roleName,
              permission: value.permission
            }
          })
        } else {
          await createRole.mutateAsync({
            organizationId,
            role: roleName,
            permission: value.permission,
            additionalFields
          })
        }
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  })

  useEffect(() => {
    if (!isOpen) return
    form.reset({
      additionalFields: getAdditionalFieldDefaultValues(configuredRoleFields),
      name: role?.role ?? "",
      permission: role?.permission ?? {}
    })
  }, [configuredRoleFields, form, isOpen, role?.permission, role?.role])

  const pending = createRole.isPending || updateRole.isPending

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="max-w-xl">
          <form.AppForm>
            <form.AuthFormRoot>
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
                <form.AppField
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      validateStringLength(value, {
                        requiredMessage: authLocalization.auth.fieldRequired,
                        trim: true
                      })
                  }}
                >
                  {(field) => (
                    <TextField
                      isDisabled={pending}
                      isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                    >
                      <Label>{localization.roleName}</Label>
                      <Input
                        placeholder={localization.roleNamePlaceholder}
                        variant="secondary"
                      />
                      <field.AuthFormFieldError />
                    </TextField>
                  )}
                </form.AppField>
                {configuredRoleFields.map((configuredField) => (
                  <form.AppField
                    key={configuredField.name}
                    name={`additionalFields.${configuredField.name}`}
                    validators={getAuthAdditionalFieldValidators(
                      configuredField,
                      authLocalization.auth.fieldRequired
                    )}
                  >
                    {(field) => (
                      <field.AuthFormAdditionalField
                        field={configuredField}
                        isPending={pending}
                        optionalLabel={authLocalization.settings.optional}
                      />
                    )}
                  </form.AppField>
                ))}
                <form.AppField name="permission">
                  {(field) => (
                    <fieldset className="flex flex-col gap-4">
                      <legend className="mb-3 text-sm font-medium">
                        {localization.permissions}
                      </legend>
                      {Object.entries(registry).map(
                        ([resource, definition]) => (
                          <div className="flex flex-col gap-2" key={resource}>
                            <p className="text-sm font-medium">
                              {definition.label ?? resource}
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {Object.entries(definition.actions).map(
                                ([action, label]) => (
                                  <RolePermissionCheckbox
                                    action={action}
                                    isSelected={
                                      field.state.value[resource]?.includes(
                                        action
                                      ) ?? false
                                    }
                                    key={action}
                                    label={label}
                                    onChange={(checked) =>
                                      field.handleChange({
                                        ...field.state.value,
                                        [resource]: checked
                                          ? [
                                              ...(field.state.value[resource] ??
                                                []),
                                              action
                                            ]
                                          : (
                                              field.state.value[resource] ?? []
                                            ).filter(
                                              (entry) => entry !== action
                                            )
                                      })
                                    }
                                    organizationId={organizationId}
                                    pending={pending}
                                    resource={resource}
                                  />
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </fieldset>
                  )}
                </form.AppField>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" isDisabled={pending}>
                  {authLocalization.settings.cancel}
                </Button>
                <form.AuthFormSubmitButton isDisabled={pending}>
                  {authLocalization.settings.saveChanges}
                </form.AuthFormSubmitButton>
              </AlertDialog.Footer>
            </form.AuthFormRoot>
          </form.AppForm>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}

function RolePermissionCheckbox({
  action,
  isSelected,
  label,
  onChange,
  organizationId,
  pending,
  resource
}: {
  action: string
  isSelected: boolean
  label: string
  onChange: (checked: boolean) => void
  organizationId: string
  pending: boolean
  resource: string
}) {
  const { authClient } = useAuth()
  const client = authClient as OrganizationRolesAuthClient
  const canAssign = useHasPermission(client, {
    organizationId,
    permissions: { [resource]: [action] } as Parameters<
      OrganizationRolesAuthClient["organization"]["hasPermission"]
    >[0]["permissions"]
  })

  return (
    <Checkbox
      isDisabled={
        pending ||
        canAssign.isPending ||
        (!isSelected && !canAssign.data?.success)
      }
      isSelected={isSelected}
      onChange={onChange}
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
