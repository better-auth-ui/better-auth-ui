import {
  type AdditionalFields,
  fieldsWithModelValues,
  parseAdditionalFieldValues
} from "@better-auth-ui/core"
import type {
  OrganizationPermissionRegistry,
  OrganizationRolesAuthClient
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
import { Filter, Pencil, Plus, Search, Trash2, X } from "lucide-solid"
import { createEffect, createSignal, For, Show } from "solid-js"
import { toast } from "solid-sonner"
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
import { AdditionalField } from "../additional-field"
import { OrganizationSortableTableHead } from "./organization-sortable-table-head"
import {
  createOrganizationColumnHelper,
  createOrganizationTable,
  ORGANIZATION_TABLE_PAGE_SIZE
} from "./organization-table"
import { OrganizationTableBulkAction } from "./organization-table-bulk-action"
import { OrganizationTablePagination } from "./organization-table-pagination"
import {
  type OrganizationSelectableRow,
  OrganizationTableSelectAll,
  OrganizationTableSelectRow
} from "./organization-table-selection"
import { createOrganizationTableState } from "./organization-table-state"
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

export function OrganizationRoles(props: { organizationId: string }) {
  const auth = useAuth<OrganizationRolesAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const canRead = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { ac: ["read"] }
  }))
  const roles = useListRoles(auth.authClient, () => ({
    query: { organizationId: props.organizationId },
    enabled: !!props.organizationId && canRead.data?.success === true
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
  const [editingRole, setEditingRole] = createSignal<Role | null | undefined>()
  const tableState = createOrganizationTableState(
    "organizationRoles",
    ORGANIZATION_TABLE_PAGE_SIZE
  )
  const table = createOrganizationTable({
    columns: roleColumns,
    get data() {
      return roles.data ?? EMPTY_ROLES
    },
    get enableRowSelection() {
      return canDelete.data?.success === true
    },
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
    get state() {
      return {
        columnFilters: tableState.columnFilters(),
        columnVisibility: {
          ...tableState.columnVisibility(),
          permissionResources: false
        },
        globalFilter: tableState.globalFilter(),
        pagination: tableState.pagination(),
        rowSelection: tableState.rowSelection(),
        sorting: tableState.sorting()
      }
    },
    getRowId: (role) => role.id,
    onColumnFiltersChange: tableState.setColumnFilters,
    onColumnVisibilityChange: tableState.setColumnVisibility,
    onGlobalFilterChange: tableState.setGlobalFilter,
    onPaginationChange: tableState.setPagination,
    onRowSelectionChange: tableState.setRowSelection,
    onSortingChange: tableState.setSorting
  })
  const deleteRoles = useDeleteRole(auth.authClient, () => props.organizationId)
  const permissionFilter = () =>
    String(table.getColumn("permissionResources")?.getFilterValue() ?? "all")
  const permissionResources = () =>
    Array.from(
      new Set(
        (roles.data ?? EMPTY_ROLES).flatMap((role) =>
          Object.keys(role.permission)
        )
      )
    ).sort()
  const permissionFacetRows = () =>
    table.getColumn("permissionResources")?.getFacetedRowModel().flatRows
  const selectedRoles = () => table.getSelectedRowModel().rows
  const deleteSelectedRoles = async () => {
    const results = await Promise.allSettled(
      selectedRoles().map((row) =>
        deleteRoles.mutateAsync({
          roleId: row.original.id,
          organizationId: props.organizationId
        })
      )
    )
    const count = results.filter(
      (result) => result.status === "fulfilled"
    ).length
    const failed = results.find((result) => result.status === "rejected")
    if (count)
      toast.success(
        config.localization.rolesDeleted.replace("{{count}}", String(count))
      )
    if (failed?.status === "rejected")
      toast.error(
        failed.reason instanceof Error
          ? failed.reason.message
          : String(failed.reason)
      )
    table.resetRowSelection(true)
  }

  return (
    <div class="flex flex-col gap-4">
      <div class="flex items-end justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold">{config.localization.roles}</h2>
          <p class="text-sm text-muted-foreground">
            {config.localization.rolesDescription}
          </p>
        </div>
        <Show when={canCreate.isPending || canCreate.data?.success}>
          <Button
            disabled={canCreate.isPending}
            onClick={() => setEditingRole(null)}
          >
            <Plus />
            {config.localization.createRole}
          </Button>
        </Show>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <InputGroup class="min-w-0 sm:w-[220px]">
          <InputGroupAddon>
            <Search class="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={config.localization.search}
            onInput={(event) =>
              table.setGlobalFilter(event.currentTarget.value)
            }
            placeholder={config.localization.search}
            type="search"
            value={tableState.globalFilter()}
          />
        </InputGroup>
        <DropdownMenu>
          <DropdownMenuTrigger as={Button} class="shrink-0" variant="outline">
            <Filter />
            {config.localization.permissions}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={permissionFilter()}
              onChange={(value) =>
                table
                  .getColumn("permissionResources")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }
            >
              <DropdownMenuRadioItem value="all">
                {config.localization.all}
              </DropdownMenuRadioItem>
              <For each={permissionResources()}>
                {(resource) => (
                  <DropdownMenuRadioItem value={resource}>
                    {config.dynamicAccessControl?.permissions[resource]
                      ?.label ?? resource}{" "}
                    (
                    {permissionFacetRows()?.filter((row) =>
                      Object.hasOwn(row.original.permission, resource)
                    ).length ?? 0}
                    )
                  </DropdownMenuRadioItem>
                )}
              </For>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div class="ms-auto">
          <OrganizationTableViewOptions
            columns={[
              {
                id: "permissions",
                label: config.localization.permissions,
                visible: table.getColumn("permissions")?.getIsVisible() ?? true,
                onVisibleChange: (visible) =>
                  table.getColumn("permissions")?.toggleVisibility(visible)
              }
            ]}
            localization={config.localization}
          />
        </div>
      </div>

      <Show when={permissionFilter() !== "all"}>
        <Badge class="w-fit gap-1" variant="secondary">
          {config.dynamicAccessControl?.permissions[permissionFilter()]
            ?.label ?? permissionFilter()}
          <Button
            aria-label={config.localization.clear}
            class="size-4"
            onClick={() =>
              table.getColumn("permissionResources")?.setFilterValue(undefined)
            }
            size="icon-xs"
            variant="ghost"
          >
            <X />
          </Button>
        </Badge>
      </Show>

      <OrganizationTableBulkAction
        cancelLabel={auth.localization.settings.cancel}
        confirmLabel={config.localization.deleteSelectedRoles}
        description={config.localization.deleteSelectedRolesDescription}
        localization={config.localization}
        onConfirm={deleteSelectedRoles}
        pending={deleteRoles.isPending}
        selectedCount={selectedRoles().length}
        title={config.localization.deleteSelectedRoles}
      />

      <Show
        when={!canRead.isPending && !roles.isLoading}
        fallback={<Spinner />}
      >
        <Show when={canRead.data?.success}>
          <Show
            when={roles.data?.length}
            fallback={
              <Card>
                <CardContent class="flex flex-col gap-1">
                  <p class="text-sm font-medium">
                    {config.localization.noRoles}
                  </p>
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
                      <Show when={canDelete.data?.success}>
                        <TableHead>
                          <OrganizationTableSelectAll
                            allSelected={table.getIsAllPageRowsSelected()}
                            localization={config.localization}
                            onCheckedChange={(checked) =>
                              table.toggleAllPageRowsSelected(checked)
                            }
                            someSelected={table.getIsSomePageRowsSelected()}
                          />
                        </TableHead>
                      </Show>
                      <OrganizationSortableTableHead
                        column={table.getColumn("role")}
                      >
                        {config.localization.roleName}
                      </OrganizationSortableTableHead>
                      <Show
                        when={table.getColumn("permissions")?.getIsVisible()}
                      >
                        <OrganizationSortableTableHead
                          column={table.getColumn("permissions")}
                        >
                          {config.localization.permissions}
                        </OrganizationSortableTableHead>
                      </Show>
                      <TableHead class="text-end">
                        {config.localization.actions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <For each={table.getRowModel().rows}>
                      {(row) => (
                        <OrganizationRoleRow
                          authClient={auth.authClient}
                          canDelete={canDelete.data?.success === true}
                          canDeletePending={canDelete.isPending}
                          canUpdate={canUpdate.data?.success === true}
                          canUpdatePending={canUpdate.isPending}
                          onEdit={() => setEditingRole(row.original)}
                          organizationId={props.organizationId}
                          role={row.original}
                          selectableRow={
                            canDelete.data?.success ? row : undefined
                          }
                          showPermissions={
                            table.getColumn("permissions")?.getIsVisible() ===
                            true
                          }
                        />
                      )}
                    </For>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Show>
        </Show>
      </Show>

      <OrganizationTablePagination
        canNextPage={table.getCanNextPage()}
        canPreviousPage={table.getCanPreviousPage()}
        disabled={roles.isLoading}
        localization={config.localization}
        onFirstPage={() => table.firstPage()}
        onLastPage={() => table.lastPage()}
        onNextPage={() => table.nextPage()}
        onPageSizeChange={(size) => table.setPageSize(size)}
        onPreviousPage={() => table.previousPage()}
        pageCount={table.getPageCount()}
        pageIndex={tableState.pagination().pageIndex}
        pageSize={tableState.pagination().pageSize}
        rowCount={table.getRowCount()}
        visibleRowCount={table.getRowModel().rows.length}
      />

      <RoleDialog
        onOpenChange={(open) => !open && setEditingRole(undefined)}
        open={editingRole() !== undefined}
        organizationId={props.organizationId}
        registry={config.dynamicAccessControl?.permissions ?? {}}
        role={editingRole() ?? undefined}
        roleFields={config.modelFields.role}
      />
    </div>
  )
}

function OrganizationRoleRow(props: {
  authClient: OrganizationRolesAuthClient
  canDelete: boolean
  canDeletePending: boolean
  canUpdate: boolean
  canUpdatePending: boolean
  onEdit: () => void
  organizationId: string
  role: Role
  selectableRow?: OrganizationSelectableRow
  showPermissions: boolean
}) {
  const auth = useAuth()
  const config = useAuthPlugin(organizationPlugin)
  const [deleteOpen, setDeleteOpen] = createSignal(false)
  const deleteRole = useDeleteRole(
    props.authClient,
    () => props.organizationId,
    () => ({
      onSuccess: () => {
        setDeleteOpen(false)
        toast.success(config.localization.roleDeleted)
      },
      onError: (error) => toast.error(error.message)
    })
  )
  const assignments = useListOrganizationMembers(props.authClient, () => ({
    query: {
      organizationId: props.organizationId,
      filterField: "role",
      filterOperator: "contains",
      filterValue: props.role.role,
      limit: 1
    },
    enabled: Boolean(props.organizationId && props.canDelete)
  }))
  const assignedCount = () =>
    assignments.data?.total ?? assignments.data?.members.length ?? 0
  const assignmentUnknown = () => props.canDelete && !assignments.data
  const deleteDisabled = () =>
    assignmentUnknown() || assignedCount() > 0 || deleteRole.isPending

  return (
    <TableRow>
      <Show when={props.selectableRow}>
        {(row) => (
          <TableCell>
            <OrganizationTableSelectRow
              localization={config.localization}
              row={row()}
            />
          </TableCell>
        )}
      </Show>
      <TableCell class="font-medium">{props.role.role}</TableCell>
      <Show when={props.showPermissions}>
        <TableCell>
          {Object.values(props.role.permission).reduce(
            (total, actions) => total + actions.length,
            0
          )}
        </TableCell>
      </Show>
      <TableCell>
        <div class="flex justify-end gap-1">
          <Show when={props.canUpdatePending}>
            <Button
              aria-label={config.localization.editRole}
              disabled
              size="icon-sm"
              variant="ghost"
            >
              <Pencil />
            </Button>
          </Show>
          <Show when={props.canUpdate}>
            <Button
              aria-label={config.localization.editRole}
              onClick={props.onEdit}
              size="icon-sm"
              variant="ghost"
            >
              <Pencil />
            </Button>
          </Show>
          <Show when={props.canDelete}>
            <AlertDialog
              open={deleteOpen()}
              onOpenChange={(open) => {
                if (!deleteRole.isPending) setDeleteOpen(open)
              }}
            >
              <AlertDialogTrigger
                as={Button}
                aria-label={config.localization.deleteRole}
                disabled={deleteDisabled()}
                size="icon-sm"
                title={
                  assignedCount() > 0
                    ? config.localization.roleInUse.replace(
                        "{{count}}",
                        String(assignedCount())
                      )
                    : config.localization.deleteRole
                }
                variant="ghost"
              >
                <Trash2 class="text-destructive" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <Trash2 />
                  </AlertDialogMedia>
                  <AlertDialogTitle>
                    {config.localization.deleteRole}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {config.localization.deleteRoleDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <p class="break-words text-sm font-medium">{props.role.role}</p>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteRole.isPending}>
                    {auth.localization.settings.cancel}
                  </AlertDialogCancel>
                  <Button
                    variant="destructive"
                    disabled={deleteDisabled()}
                    onClick={() =>
                      deleteRole.mutate({
                        roleId: props.role.id,
                        organizationId: props.organizationId
                      })
                    }
                  >
                    <Show when={deleteRole.isPending}>
                      <Spinner />
                    </Show>
                    {config.localization.deleteRole}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Show>
          <Show when={props.canDeletePending}>
            <Button
              aria-label={config.localization.deleteRole}
              disabled
              size="icon-sm"
              variant="ghost"
            >
              <Trash2 class="text-destructive" />
            </Button>
          </Show>
        </div>
      </TableCell>
    </TableRow>
  )
}

function RoleDialog(props: {
  onOpenChange: (open: boolean) => void
  open: boolean
  organizationId: string
  registry: OrganizationPermissionRegistry
  role?: Role
  roleFields: AdditionalFields
}) {
  const auth = useAuth<OrganizationRolesAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const [name, setName] = createSignal("")
  const [permission, setPermission] = createSignal<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = createSignal(false)
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

  const submit = async (event: SubmitEvent) => {
    event.preventDefault()
    const roleName = name().trim()
    if (!roleName) return

    setIsSubmitting(true)
    try {
      const selectedPermissions = permission()
      if (
        Object.values(selectedPermissions).some((actions) => actions.length > 0)
      ) {
        const access = await auth.authClient.organization.hasPermission({
          organizationId: props.organizationId,
          permissions: selectedPermissions as Parameters<
            OrganizationRolesAuthClient["organization"]["hasPermission"]
          >[0]["permissions"]
        })

        if (access.error || !access.data?.success) {
          toast.error(config.localization.permissionsLimitedDescription)
          setIsSubmitting(false)
          return
        }
      }

      const additionalFields = await parseAdditionalFieldValues(
        props.roleFields,
        new FormData(event.currentTarget as HTMLFormElement)
      )
      if (props.role) {
        updateRole.mutate(
          {
            organizationId: props.organizationId,
            roleId: props.role.id,
            data: { ...additionalFields, roleName, permission: permission() }
          },
          { onSettled: () => setIsSubmitting(false) }
        )
      } else {
        createRole.mutate(
          {
            organizationId: props.organizationId,
            role: roleName,
            permission: permission(),
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

  const pending = () =>
    createRole.isPending || updateRole.isPending || isSubmitting()

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

          <For each={fieldsWithModelValues(props.roleFields, props.role ?? {})}>
            {(field) => (
              <AdditionalField
                field={field}
                isPending={pending()}
                name={field.name}
                optionalLabel={auth.localization.settings.optional}
              />
            )}
          </For>

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
                      {([action, label]) => (
                        <RolePermissionCheckbox
                          action={action}
                          checked={
                            permission()[resource]?.includes(action) ?? false
                          }
                          label={label}
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
                          organizationId={props.organizationId}
                          pending={pending()}
                          resource={resource}
                        />
                      )}
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

function RolePermissionCheckbox(props: {
  action: string
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
  organizationId: string
  pending: boolean
  resource: string
}) {
  const auth = useAuth<OrganizationRolesAuthClient>()
  const canAssign = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { [props.resource]: [props.action] } as Parameters<
      OrganizationRolesAuthClient["organization"]["hasPermission"]
    >[0]["permissions"]
  }))
  const id = () => `role-permission-${props.resource}-${props.action}`
  const disabled = () =>
    props.pending ||
    canAssign.isPending ||
    (!props.checked && !canAssign.data?.success)

  return (
    <Field orientation="horizontal">
      <Checkbox
        checked={props.checked}
        disabled={disabled()}
        id={id()}
        onChange={props.onChange}
      />
      <FieldLabel for={id()}>{props.label}</FieldLabel>
    </Field>
  )
}
