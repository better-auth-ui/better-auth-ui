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
import { Filter, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
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
import { cn } from "@/lib/utils"
import { AdditionalField } from "../additional-field"
import { OrganizationSortableTableHead } from "./organization-sortable-table-head"
import {
  createOrganizationColumnHelper,
  ORGANIZATION_TABLE_PAGE_SIZE,
  useOrganizationTable
} from "./organization-table"
import { OrganizationTableBulkAction } from "./organization-table-bulk-action"
import { OrganizationTablePagination } from "./organization-table-pagination"
import {
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
const EMPTY_ROLES: Role[] = []

export function OrganizationRoles({
  organizationId
}: {
  organizationId: string
}) {
  const { authClient, localization: authLocalization } =
    useAuth<OrganizationRolesAuthClient>()
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
  const [editingRole, setEditingRole] = useState<Role | null>()
  const tableState = useOrganizationTableState(
    "organizationRoles",
    ORGANIZATION_TABLE_PAGE_SIZE
  )
  const {
    columnFilters,
    columnVisibility,
    globalFilter,
    pagination,
    rowSelection,
    sorting
  } = tableState
  const table = useOrganizationTable({
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
      columnFilters,
      columnVisibility: {
        ...columnVisibility,
        permissionResources: false
      },
      globalFilter,
      pagination,
      rowSelection,
      sorting
    },
    onColumnFiltersChange: tableState.setColumnFilters,
    onColumnVisibilityChange: tableState.setColumnVisibility,
    onGlobalFilterChange: tableState.setGlobalFilter,
    onPaginationChange: tableState.setPagination,
    onRowSelectionChange: tableState.setRowSelection,
    onSortingChange: tableState.setSorting
  })
  const deleteRoles = useDeleteRole(authClient, organizationId)
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

    if (deletedCount > 0) {
      toast.success(
        localization.rolesDeleted.replace("{{count}}", String(deletedCount))
      )
    }
    if (failed?.status === "rejected") {
      toast.error(
        failed.reason instanceof Error
          ? failed.reason.message
          : String(failed.reason)
      )
    }
    table.resetRowSelection(true)
  }

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

      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="min-w-0 sm:w-[220px]">
          <InputGroupInput
            aria-label={localization.search}
            disabled={roles.isLoading}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            placeholder={localization.search}
            type="search"
            value={globalFilter}
          />
          <InputGroupAddon>
            <Search className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            disabled={roles.isLoading}
          >
            <Filter />
            {localization.permissions}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              onValueChange={(value) =>
                table
                  .getColumn("permissionResources")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }
              value={permissionFilter}
            >
              <DropdownMenuRadioItem value="all">
                {localization.all}
              </DropdownMenuRadioItem>
              {permissionResources.map((resource) => (
                <DropdownMenuRadioItem key={resource} value={resource}>
                  {dynamicAccessControl?.permissions[resource]?.label ??
                    resource}{" "}
                  (
                  {permissionFacetRows?.filter((row) =>
                    Object.hasOwn(row.original.permission, resource)
                  ).length ?? 0}
                  )
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

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
        <Badge className="w-fit gap-1" variant="secondary">
          {dynamicAccessControl?.permissions[permissionFilter]?.label ??
            permissionFilter}
          <Button
            aria-label={localization.clear}
            className="size-4 rounded-sm text-muted-foreground"
            onClick={() =>
              table.getColumn("permissionResources")?.setFilterValue(undefined)
            }
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <X className="size-3" />
          </Button>
        </Badge>
      )}

      {selectedRoles.length > 0 && (
        <OrganizationTableBulkAction
          actionLabel={localization.deleteSelectedRoles}
          cancelLabel={authLocalization.settings.cancel}
          count={selectedRoles.length}
          description={localization.deleteSelectedRolesDescription}
          isPending={deleteRoles.isPending}
          onConfirm={deleteSelectedRoles}
          selectedLabel={localization.selectedCount}
        />
      )}

      {canRead.isPending || roles.isLoading ? (
        <Spinner />
      ) : !canRead.data?.success ? null : roles.data?.length ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {showSelection && (
                    <TableHead className="w-10">
                      <OrganizationTableSelectAll
                        allSelected={table.getIsAllPageRowsSelected()}
                        disabled={roles.isLoading}
                        localization={localization}
                        onCheckedChange={(checked) =>
                          table.toggleAllPageRowsSelected(checked)
                        }
                        someSelected={table.getIsSomePageRowsSelected()}
                      />
                    </TableHead>
                  )}
                  <OrganizationSortableTableHead
                    column={table.getColumn("role")}
                  >
                    {localization.roleName}
                  </OrganizationSortableTableHead>
                  {table.getColumn("permissions")?.getIsVisible() && (
                    <OrganizationSortableTableHead
                      column={table.getColumn("permissions")}
                    >
                      {localization.permissions}
                    </OrganizationSortableTableHead>
                  )}
                  <TableHead className="text-right">
                    {localization.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <OrganizationRoleRow
                    key={row.original.id}
                    authClient={authClient}
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

      <OrganizationTablePagination
        canNextPage={table.getCanNextPage()}
        canPreviousPage={table.getCanPreviousPage()}
        disabled={roles.isLoading}
        localization={localization}
        onFirstPage={() => table.firstPage()}
        onLastPage={() => table.lastPage()}
        onNextPage={() => table.nextPage()}
        onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
        onPreviousPage={() => table.previousPage()}
        pageCount={table.getPageCount()}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        rowCount={table.getRowCount()}
        visibleRowCount={table.getRowModel().rows.length}
      />

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
  selectableRow?: Parameters<typeof OrganizationTableSelectRow>[0]["row"]
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
    onError: (error) => toast.error(error.message)
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
    <TableRow
      data-state={selectableRow?.getIsSelected() ? "selected" : undefined}
    >
      {selectableRow && (
        <TableCell>
          <OrganizationTableSelectRow
            localization={localization}
            row={selectableRow}
          />
        </TableCell>
      )}
      <TableCell className="font-medium">{role.role}</TableCell>
      {showPermissions && (
        <TableCell>
          {Object.values(role.permission).reduce(
            (total, actions) => total + actions.length,
            0
          )}
        </TableCell>
      )}
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
            <AlertDialog
              open={deleteOpen}
              onOpenChange={(open) => {
                if (!deleteRole.isPending) setDeleteOpen(open)
              }}
            >
              <AlertDialogTrigger
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                  className: "text-destructive"
                })}
                disabled={deleteDisabled}
                title={
                  assignedCount > 0
                    ? localization.roleInUse.replace(
                        "{{count}}",
                        String(assignedCount)
                      )
                    : localization.deleteRole
                }
                aria-label={localization.deleteRole}
              >
                <Trash2 />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <Trash2 />
                  </AlertDialogMedia>
                  <AlertDialogTitle>{localization.deleteRole}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {localization.deleteRoleDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <p className="break-words text-sm font-medium">{role.role}</p>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteRole.isPending}>
                    {authLocalization.settings.cancel}
                  </AlertDialogCancel>
                  <Button
                    variant="destructive"
                    disabled={deleteDisabled}
                    onClick={() =>
                      deleteRole.mutate({ roleId: role.id, organizationId })
                    }
                  >
                    {deleteRole.isPending && <Spinner />}
                    {localization.deleteRole}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
