import {
  DEFAULT_TABLE_SEARCH_DEBOUNCE_MS,
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getClampedTablePageIndex
} from "@better-auth-ui/core"
import {
  type AdminAuthClient,
  type AdminListUsersParams,
  type AdminUser,
  adminPlugin,
  isAdminTarget
} from "@better-auth-ui/core/plugins/admin"
import { useAuth, useSession } from "@better-auth-ui/solid"
import {
  useAdminPermission,
  useAdminUser,
  useAdminUserSessions,
  useAdminUsers,
  useBanAdminUser,
  useCreateAdminUser,
  useImpersonateAdminUser,
  useRemoveAdminUser,
  useRevokeAdminUserSession,
  useRevokeAdminUserSessions,
  useSetAdminUserPassword,
  useSetAdminUserRole,
  useUnbanAdminUser,
  useUpdateAdminUser
} from "@better-auth-ui/solid/plugins/admin"
import { createDebouncedValue } from "@tanstack/solid-pacer"
import type { SortingState } from "@tanstack/solid-table"
import {
  Ban,
  Copy,
  Ellipsis,
  KeyRound,
  LogIn,
  Search,
  Trash2,
  UserPlus
} from "lucide-solid"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { createServerTableState } from "@/components/auth/server-table-state"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { createAuthForm, getAuthAdditionalFieldValidators } from "../auth-form"
import { UserAvatar } from "../user/user-avatar"
import { createAdminColumnHelper, createAdminTable } from "./admin-table"

export type AdminUsersProps = {
  class?: string
  onSelectedUserIdChange?: (userId: string | undefined) => void
  selectedUserId?: string
}

type DangerousAction = "ban" | "delete" | "impersonate" | "revokeAll"
type SearchOperator = "contains" | "ends_with" | "starts_with"
type SortOption = "createdAt-asc" | "createdAt-desc" | "name-asc" | "name-desc"
type StatusFilter = "active" | "all" | "banned"

const skeletonIds = ["solid-admin-1", "solid-admin-2", "solid-admin-3"]

const formatDate = (value: Date | string | undefined | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "–"

const asAdminRoles = (roles: string[]) => roles as ("user" | "admin")[]

const parseAdminRoles = (
  role: string | undefined,
  fallback: string,
  allowMultipleRoles: boolean
) => {
  const roles = role
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  const resolved = roles?.length ? roles : [fallback]
  return allowMultipleRoles ? resolved : resolved.slice(0, 1)
}

const getBanDurationSeconds = (value: string) => {
  if (!value) return undefined
  const days = Number(value)
  if (!Number.isSafeInteger(days) || days <= 0) return null
  const seconds = days * 86_400
  return Number.isSafeInteger(seconds) ? seconds : null
}

const getAdminErrorMessage = (error: Error | null) => error?.message

const adminColumnHelper = createAdminColumnHelper<AdminUser>()
const adminColumns = adminColumnHelper.columns([
  adminColumnHelper.accessor("name", { id: "name" }),
  adminColumnHelper.accessor("role", {
    id: "role",
    enableSorting: false
  }),
  adminColumnHelper.accessor("banned", {
    id: "status",
    enableSorting: false
  }),
  adminColumnHelper.accessor((user) => new Date(user.createdAt).getTime(), {
    id: "createdAt"
  })
])
const EMPTY_USERS: AdminUser[] = []
const INITIAL_ADMIN_SORTING: SortingState = [{ id: "createdAt", desc: true }]

/** Zaidan presentation for the static Admin users view. */
export function AdminUsers(props: AdminUsersProps) {
  const auth = useAuth()
  const authClient = auth.authClient as AdminAuthClient
  const defaults = adminPlugin()
  const config = () =>
    (auth.plugins.find((plugin) => plugin.id === adminPlugin.id) ??
      defaults) as typeof defaults
  const [localSelectedUserId, setLocalSelectedUserId] = createSignal<string>()
  const tableState = createServerTableState({
    initialSorting: INITIAL_ADMIN_SORTING,
    pageSize: config().pageSize
  })
  const { columnFilters, globalFilter, pagination, sorting } = tableState
  const [debouncedSearch] = createDebouncedValue(() => globalFilter().trim(), {
    wait: DEFAULT_TABLE_SEARCH_DEBOUNCE_MS
  })
  const [searchField, setSearchField] = createSignal<"email" | "name">("email")
  const [searchOperator, setSearchOperator] =
    createSignal<SearchOperator>("contains")
  const status = () =>
    String(
      columnFilters().find((filter) => filter.id === "status")?.value ?? "all"
    ) as StatusFilter
  const sort = () => {
    const primarySort = sorting()[0]
    return `${primarySort?.id === "name" ? "name" : "createdAt"}-${primarySort?.desc ? "desc" : "asc"}` as SortOption
  }
  const selectedUserId = () =>
    props.onSelectedUserIdChange ? props.selectedUserId : localSelectedUserId()
  const permission = useAdminPermission(authClient, () => ({ user: ["list"] }))
  const createPermission = useAdminPermission(authClient, () => ({
    user: ["create"]
  }))
  const getPermission = useAdminPermission(authClient, () => ({
    user: ["get"]
  }))
  const [createOpen, setCreateOpen] = createSignal(false)
  const params = createMemo<AdminListUsersParams>(() => {
    const [sortBy, sortDirection] = sort().split("-") as [
      "createdAt" | "name",
      "asc" | "desc"
    ]
    return {
      filterField: status() === "all" ? undefined : "banned",
      filterOperator: status() === "all" ? undefined : "eq",
      filterValue: status() === "all" ? undefined : status() === "banned",
      limit: pagination().pageSize,
      offset: pagination().pageIndex * pagination().pageSize,
      searchField: searchField(),
      searchOperator: searchOperator(),
      searchValue: debouncedSearch() || undefined,
      sortBy,
      sortDirection
    }
  })
  const users = useAdminUsers(authClient, () => ({
    enabled: permission.data?.success === true,
    params: params()
  }))

  const selectUser = (userId: string | undefined) => {
    if (!props.onSelectedUserIdChange) setLocalSelectedUserId(userId)
    props.onSelectedUserIdChange?.(userId)
  }
  const total = () => users.data?.total ?? 0

  createEffect(() => {
    if (!users.isSuccess) return
    const current = pagination()
    const pageIndex = getClampedTablePageIndex(
      current.pageIndex,
      current.pageSize,
      total()
    )
    if (pageIndex !== current.pageIndex) {
      tableState.setPagination({ ...current, pageIndex })
    }
  })
  const table = createAdminTable({
    atoms: tableState.atoms,
    columns: adminColumns,
    get data() {
      return users.data?.users ?? EMPTY_USERS
    },
    get rowCount() {
      return total()
    },
    getRowId: (user) => user.id,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true
  })

  return (
    <section class={cn("flex flex-col gap-4", props.class)}>
      <header class="flex items-end justify-between gap-3">
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-semibold">{config().localization.users}</h1>
          <p class="text-sm text-muted-foreground">
            {config().localization.usersDescription}
          </p>
        </div>
        <Show when={createPermission.data?.success}>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus />
            {config().localization.createUser}
          </Button>
        </Show>
      </header>

      <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-[9rem_10rem_minmax(14rem,1fr)_10rem_10rem]">
        <select
          aria-label={config().localization.search}
          class="h-8 rounded-lg border bg-transparent px-2 text-sm sm:w-36"
          onChange={(event) => {
            setSearchField(event.currentTarget.value as "email" | "name")
            table.setPageIndex(0)
          }}
          value={searchField()}
        >
          <option value="email">{config().localization.email}</option>
          <option value="name">{config().localization.name}</option>
        </select>
        <select
          aria-label={config().localization.searchOperator}
          class="h-8 rounded-lg border bg-transparent px-2 text-sm"
          onChange={(event) => {
            setSearchOperator(event.currentTarget.value as SearchOperator)
            table.setPageIndex(0)
          }}
          value={searchOperator()}
        >
          <option value="contains">
            {config().localization.searchContains}
          </option>
          <option value="starts_with">
            {config().localization.startsWith}
          </option>
          <option value="ends_with">{config().localization.endsWith}</option>
        </select>
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={
              searchField() === "email"
                ? config().localization.searchByEmail
                : config().localization.searchByName
            }
            onInput={(event) => {
              table.setGlobalFilter(event.currentTarget.value)
            }}
            placeholder={
              searchField() === "email"
                ? config().localization.searchByEmail
                : config().localization.searchByName
            }
            value={globalFilter()}
          />
        </InputGroup>
        <select
          aria-label={config().localization.status}
          class="h-8 rounded-lg border bg-transparent px-2 text-sm"
          onChange={(event) => {
            const nextStatus = event.currentTarget.value as StatusFilter
            table
              .getColumn("status")
              ?.setFilterValue(nextStatus === "all" ? undefined : nextStatus)
          }}
          value={status()}
        >
          <option value="all">{config().localization.filterAllStatuses}</option>
          <option value="active">{config().localization.active}</option>
          <option value="banned">{config().localization.banned}</option>
        </select>
        <select
          aria-label={config().localization.sort}
          class="h-8 rounded-lg border bg-transparent px-2 text-sm"
          onChange={(event) => {
            const [id, direction] = event.currentTarget.value.split("-") as [
              "createdAt" | "name",
              "asc" | "desc"
            ]
            table.setSorting([{ id, desc: direction === "desc" }])
          }}
          value={sort()}
        >
          <option value="createdAt-desc">
            {config().localization.sortNewest}
          </option>
          <option value="createdAt-asc">
            {config().localization.sortOldest}
          </option>
          <option value="name-asc">
            {config().localization.sortNameAscending}
          </option>
          <option value="name-desc">
            {config().localization.sortNameDescending}
          </option>
        </select>
      </div>

      <Show
        fallback={
          <AdminMessage
            title={config().localization.accessDenied}
            description={config().localization.accessDeniedDescription}
          />
        }
        when={permission.isPending || permission.data?.success}
      >
        <Show
          fallback={
            <AdminMessage
              title={config().localization.loadUsersError}
              description={config().localization.loadUsersErrorDescription}
            />
          }
          when={!users.isError}
        >
          <div class="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{config().localization.name}</TableHead>
                  <TableHead>{config().localization.role}</TableHead>
                  <TableHead>{config().localization.status}</TableHead>
                  <TableHead>{config().localization.created}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Show
                  fallback={
                    <Show
                      fallback={
                        <TableRow>
                          <TableCell colspan="4">
                            <Empty class="min-h-48 gap-2 p-4">
                              <EmptyHeader class="gap-1">
                                <EmptyTitle>
                                  {config().localization.noUsers}
                                </EmptyTitle>
                                <EmptyDescription>
                                  {config().localization.noUsersDescription}
                                </EmptyDescription>
                              </EmptyHeader>
                            </Empty>
                          </TableCell>
                        </TableRow>
                      }
                      when={table.getRowModel().rows.length}
                    >
                      <For each={table.getRowModel().rows}>
                        {(row) => {
                          const user = row.original
                          return (
                            <TableRow
                              aria-selected={selectedUserId() === user.id}
                              class={
                                getPermission.data?.success
                                  ? "cursor-pointer"
                                  : undefined
                              }
                              onClick={
                                getPermission.data?.success
                                  ? () => selectUser(user.id)
                                  : undefined
                              }
                            >
                              <TableCell>
                                <div class="flex items-center gap-3">
                                  <UserAvatar user={user} />
                                  <div class="min-w-0">
                                    <Show
                                      fallback={
                                        <span class="truncate font-medium">
                                          {user.name}
                                        </span>
                                      }
                                      when={getPermission.data?.success}
                                    >
                                      <Button
                                        class="h-auto min-w-0 justify-start p-0 font-medium"
                                        onClick={(event) => {
                                          event.stopPropagation()
                                          selectUser(user.id)
                                        }}
                                        variant="link"
                                      >
                                        <span class="truncate">
                                          {user.name}
                                        </span>
                                      </Button>
                                    </Show>
                                    <div class="truncate text-xs text-muted-foreground">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {user.role ?? config().defaultRole}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.banned ? "destructive" : "secondary"
                                  }
                                >
                                  {user.banned
                                    ? config().localization.banned
                                    : config().localization.active}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatDate(user.createdAt)}
                              </TableCell>
                            </TableRow>
                          )
                        }}
                      </For>
                    </Show>
                  }
                  when={permission.isPending || users.isPending}
                >
                  <For each={skeletonIds}>
                    {(id) => (
                      <TableRow>
                        <TableCell colspan="4">
                          <Skeleton class="h-10 w-full" data-id={id} />
                        </TableCell>
                      </TableRow>
                    )}
                  </For>
                </Show>
              </TableBody>
            </Table>
          </div>
        </Show>
      </Show>

      <footer class="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {config()
            .localization.usersPaginationRange.replace(
              "{{from}}",
              String(
                total() ? pagination().pageIndex * pagination().pageSize + 1 : 0
              )
            )
            .replace(
              "{{to}}",
              String(
                Math.min(
                  total(),
                  (pagination().pageIndex + 1) * pagination().pageSize
                )
              )
            )
            .replace("{{total}}", String(total()))}
        </span>
        <div class="flex gap-2">
          <Button
            disabled={!table.getCanPreviousPage() || users.isFetching}
            onClick={() => table.previousPage()}
            variant="outline"
          >
            {config().localization.previousPage}
          </Button>
          <Button
            disabled={!table.getCanNextPage() || users.isFetching}
            onClick={() => table.nextPage()}
            variant="outline"
          >
            {config().localization.nextPage}
          </Button>
        </div>
      </footer>

      <UserDialog
        canGetUser={getPermission.data?.success === true}
        open={Boolean(selectedUserId()) && getPermission.data?.success === true}
        onOpenChange={(open) => !open && selectUser(undefined)}
        userId={selectedUserId}
      />
      <CreateUserDialog open={createOpen()} onOpenChange={setCreateOpen} />
    </section>
  )
}

function AdminMessage(props: { description: string; title: string }) {
  return (
    <div class="flex min-h-64 flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-8 text-center">
      <h2 class="font-medium">{props.title}</h2>
      <p class="text-sm text-muted-foreground">{props.description}</p>
    </div>
  )
}

function SessionRowsSkeleton() {
  return (
    <For each={skeletonIds}>
      {(id) => <Skeleton class="h-20 w-full" data-id={`session-${id}`} />}
    </For>
  )
}

function CreateUserDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth()
  const authClient = auth.authClient as AdminAuthClient
  const config = () =>
    (auth.plugins.find((plugin) => plugin.id === adminPlugin.id) ??
      adminPlugin()) as ReturnType<typeof adminPlugin>
  const createUser = useCreateAdminUser(authClient)
  const canSetRole = useAdminPermission(authClient, () => ({
    user: ["set-role"]
  }))
  const additionalFields = () => auth.additionalFields ?? []
  const form = createAuthForm(() => ({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(additionalFields()),
      email: "",
      emailVerified: false,
      name: "",
      password: "",
      roles: [config().defaultRole]
    },
    onSubmit: async ({ value }) => {
      try {
        await createUser.mutateAsync(
          {
            data: {
              ...getAdditionalFieldSubmitValues(
                additionalFields(),
                value.additionalFields
              ),
              emailVerified: value.emailVerified
            },
            email: value.email,
            name: value.name,
            password: value.password,
            ...(canSetRole.data?.success
              ? { role: asAdminRoles(value.roles) }
              : {})
          },
          { onSuccess: close }
        )
      } catch {
        // The mutation reports the error through its configured handler.
      }
    }
  }))

  createEffect(() => {
    if (!config().allowMultipleRoles)
      form.setFieldValue("roles", (current) => current.slice(0, 1))
  })

  const close = () => {
    createUser.reset()
    form.reset()
    props.onOpenChange(false)
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => (open ? props.onOpenChange(true) : close())}
    >
      <DialogContent>
        <form.AppForm>
          <form.AuthFormRoot class="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{config().localization.createUser}</DialogTitle>
              <DialogDescription>
                {config().localization.usersDescription}
              </DialogDescription>
            </DialogHeader>
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel for="solid-admin-create-name">
                    {config().localization.name}
                  </FieldLabel>
                  <Input
                    id="solid-admin-create-name"
                    name={field().name}
                    onInput={(event) =>
                      field().handleChange(event.currentTarget.value)
                    }
                    required
                    value={field().state.value}
                  />
                </Field>
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <Field>
                  <FieldLabel for="solid-admin-create-email">
                    {config().localization.email}
                  </FieldLabel>
                  <Input
                    autocomplete="off"
                    id="solid-admin-create-email"
                    name={field().name}
                    onInput={(event) =>
                      field().handleChange(event.currentTarget.value)
                    }
                    required
                    type="email"
                    value={field().state.value}
                  />
                </Field>
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <Field>
                  <FieldLabel for="solid-admin-create-password">
                    {config().localization.password}
                  </FieldLabel>
                  <Input
                    autocomplete="new-password"
                    id="solid-admin-create-password"
                    name={field().name}
                    onInput={(event) =>
                      field().handleChange(event.currentTarget.value)
                    }
                    required
                    type="password"
                    value={field().state.value}
                  />
                </Field>
              )}
            </form.Field>
            <Show
              fallback={
                <Show when={canSetRole.isPending}>
                  <Skeleton class="h-16 w-full" />
                </Show>
              }
              when={canSetRole.data?.success}
            >
              <form.Field name="roles">
                {(field) => (
                  <FieldSet>
                    <FieldLegend variant="label">
                      {config().localization.role}
                    </FieldLegend>
                    <Show
                      when={config().allowMultipleRoles}
                      fallback={
                        <RadioGroup
                          onChange={(role) => field().handleChange([role])}
                          value={field().state.value[0] ?? ""}
                        >
                          <For each={config().roles}>
                            {(role) => (
                              <Field orientation="horizontal">
                                <RadioGroupItem
                                  id={`solid-admin-create-role-${role}`}
                                  value={role}
                                />
                                <FieldLabel
                                  for={`solid-admin-create-role-${role}`}
                                >
                                  {role}
                                </FieldLabel>
                              </Field>
                            )}
                          </For>
                        </RadioGroup>
                      }
                    >
                      <FieldGroup data-slot="checkbox-group">
                        <For each={config().roles}>
                          {(role) => (
                            <Field orientation="horizontal">
                              <Checkbox
                                checked={field().state.value.includes(role)}
                                id={`solid-admin-create-role-${role}`}
                                onChange={(checked) => {
                                  const next = checked
                                    ? [...field().state.value, role]
                                    : field().state.value.filter(
                                        (item) => item !== role
                                      )
                                  if (next.length) field().handleChange(next)
                                }}
                              />
                              <FieldLabel
                                for={`solid-admin-create-role-${role}`}
                              >
                                {role}
                              </FieldLabel>
                            </Field>
                          )}
                        </For>
                      </FieldGroup>
                    </Show>
                  </FieldSet>
                )}
              </form.Field>
            </Show>
            <form.Field name="emailVerified">
              {(field) => (
                <Field orientation="horizontal">
                  <Switch
                    checked={field().state.value}
                    id="solid-admin-create-email-verified"
                    onChange={field().handleChange}
                  />
                  <FieldContent>
                    <FieldLabel for="solid-admin-create-email-verified">
                      {config().localization.emailVerified}
                    </FieldLabel>
                  </FieldContent>
                </Field>
              )}
            </form.Field>
            <For each={additionalFields()}>
              {(configuredField) => (
                <form.AppField
                  name={`additionalFields.${configuredField.name}`}
                  validators={getAuthAdditionalFieldValidators(
                    configuredField,
                    auth.localization.auth.fieldRequired
                  )}
                >
                  {(field) => (
                    <field.AuthFormAdditionalField
                      field={configuredField}
                      isPending={createUser.isPending}
                    />
                  )}
                </form.AppField>
              )}
            </For>
            <FieldError>{getAdminErrorMessage(createUser.error)}</FieldError>
            <DialogFooter>
              <Button onClick={close} type="button" variant="outline">
                {config().localization.cancel}
              </Button>
              <form.AuthFormSubmitButton disabled={createUser.isPending}>
                {config().localization.createUser}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}

function UserDialog(props: {
  canGetUser: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: () => string | undefined
}) {
  const auth = useAuth()
  const authClient = auth.authClient as AdminAuthClient
  const config = () =>
    (auth.plugins.find((plugin) => plugin.id === adminPlugin.id) ??
      adminPlugin()) as ReturnType<typeof adminPlugin>
  const contributedTabs = createMemo(() =>
    auth.plugins.flatMap((plugin) =>
      (plugin.adminUserTabs ?? []).map((tab) => ({
        ...tab,
        value: `${plugin.id}:${tab.id}`
      }))
    )
  )
  const user = useAdminUser(authClient, props.userId, () => ({
    enabled: props.canGetUser
  }))
  const actor = useSession(authClient)
  const enabled = () => ({ enabled: Boolean(props.userId()) })
  const sessionsPermission = useAdminPermission(
    authClient,
    () => ({ session: ["list"] }),
    enabled
  )
  const sessions = useAdminUserSessions(authClient, props.userId, () => ({
    enabled: sessionsPermission.data?.success === true
  }))
  const canUpdate = useAdminPermission(
    authClient,
    () => ({ user: ["update"] }),
    enabled
  )
  const canSetRole = useAdminPermission(
    authClient,
    () => ({ user: ["set-role"] }),
    enabled
  )
  const canSetEmail = useAdminPermission(
    authClient,
    () => ({ user: ["set-email"] }),
    enabled
  )
  const canSetPassword = useAdminPermission(
    authClient,
    () => ({ user: ["set-password"] }),
    enabled
  )
  const canBan = useAdminPermission(
    authClient,
    () => ({ user: ["ban"] }),
    enabled
  )
  const canImpersonate = useAdminPermission(
    authClient,
    () => ({ user: ["impersonate"] }),
    enabled
  )
  const canDelete = useAdminPermission(
    authClient,
    () => ({ user: ["delete"] }),
    enabled
  )
  const canRevoke = useAdminPermission(
    authClient,
    () => ({ session: ["revoke"] }),
    enabled
  )
  const [banReason, setBanReason] = createSignal("")
  const [banDuration, setBanDuration] = createSignal("")
  const banDurationSeconds = createMemo(() =>
    getBanDurationSeconds(banDuration())
  )
  const [passwordOpen, setPasswordOpen] = createSignal(false)
  const [dangerousAction, setDangerousAction] = createSignal<DangerousAction>()
  const detail = () => user.data
  const targetIsAdmin = createMemo(() => {
    const target = detail()
    return target
      ? isAdminTarget(target, config().adminRoles, config().adminUserIds)
      : false
  })
  const canImpersonateAdmins = useAdminPermission(
    authClient,
    () => ({ user: ["impersonate-admins"] }),
    () => ({ enabled: Boolean(props.userId() && targetIsAdmin()) })
  )
  const isSelf = () => detail()?.id === actor.data?.user.id
  const updateUser = useUpdateAdminUser(authClient)
  const setRoleMutation = useSetAdminUserRole(authClient)
  const ban = useBanAdminUser(authClient)
  const unban = useUnbanAdminUser(authClient)
  const impersonate = useImpersonateAdminUser(authClient)
  const remove = useRemoveAdminUser(authClient)
  const revokeSession = useRevokeAdminUserSession(authClient, props.userId)
  const revokeSessions = useRevokeAdminUserSessions(authClient, props.userId)
  const configuredUserFields = () => {
    const selectedUser = detail()
    return fieldsWithModelValues(
      auth.additionalFields ?? [],
      selectedUser ? (selectedUser as unknown as Record<string, unknown>) : {}
    )
  }
  const profileForm = createAuthForm(() => ({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(configuredUserFields()),
      email: "",
      emailVerified: false,
      name: "",
      roles: [config().defaultRole]
    },
    onSubmit: async ({ value }) => {
      const selectedUser = detail()
      if (!selectedUser) return

      const mutations: Promise<unknown>[] = []
      if (canUpdate.data?.success) {
        mutations.push(
          updateUser.mutateAsync({
            userId: selectedUser.id,
            data: {
              ...getAdditionalFieldSubmitValues(
                configuredUserFields(),
                value.additionalFields
              ),
              name: value.name.trim(),
              ...(canSetEmail.data?.success
                ? {
                    email: value.email.trim(),
                    emailVerified: value.emailVerified
                  }
                : {})
            }
          })
        )
      }
      if (canSetRole.data?.success && !isSelf()) {
        mutations.push(
          setRoleMutation.mutateAsync({
            userId: selectedUser.id,
            role: asAdminRoles(value.roles)
          })
        )
      }

      try {
        await Promise.all(mutations)
        props.onOpenChange(false)
      } catch {
        // Mutation errors are rendered next to the form.
      }
    }
  }))

  createEffect(() => {
    const selectedUser = detail()
    profileForm.reset({
      additionalFields: getAdditionalFieldDefaultValues(configuredUserFields()),
      email: selectedUser?.email ?? "",
      emailVerified: selectedUser?.emailVerified ?? false,
      name: selectedUser?.name ?? "",
      roles: parseAdminRoles(
        selectedUser?.role,
        config().defaultRole,
        config().allowMultipleRoles
      )
    })
  })

  const confirmDangerousAction = () => {
    const selectedUser = detail()
    if (!selectedUser) return
    if (dangerousAction() === "ban") {
      const durationSeconds = banDurationSeconds()
      if (durationSeconds === null) return
      ban.mutate(
        {
          banExpiresIn: durationSeconds,
          banReason: banReason().trim() || undefined,
          userId: selectedUser.id
        },
        {
          onSuccess: () => {
            setBanDuration("")
            setBanReason("")
            setDangerousAction(undefined)
          }
        }
      )
    }
    if (dangerousAction() === "delete")
      remove.mutate(
        { userId: selectedUser.id },
        {
          onSuccess: () => {
            setDangerousAction(undefined)
            props.onOpenChange(false)
          }
        }
      )
    if (dangerousAction() === "revokeAll")
      revokeSessions.mutate(
        { userId: selectedUser.id },
        { onSuccess: () => setDangerousAction(undefined) }
      )
    if (dangerousAction() === "impersonate")
      impersonate.mutate(
        { userId: selectedUser.id },
        {
          onSuccess: () => {
            setDangerousAction(undefined)
            const redirectTo = config().impersonationRedirectTo
            if (redirectTo) auth.navigate({ to: redirectTo })
          }
        }
      )
  }
  const closeDangerousAction = () => {
    ban.reset()
    remove.reset()
    revokeSessions.reset()
    impersonate.reset()
    setBanDuration("")
    setBanReason("")
    setDangerousAction(undefined)
  }
  const dangerousMutation = () =>
    dangerousAction() === "ban"
      ? ban
      : dangerousAction() === "delete"
        ? remove
        : dangerousAction() === "revokeAll"
          ? revokeSessions
          : impersonate
  const dangerousLabel = () =>
    dangerousAction() === "ban"
      ? config().localization.banUser
      : dangerousAction() === "delete"
        ? config().localization.deleteUser
        : dangerousAction() === "revokeAll"
          ? config().localization.revokeAllSessions
          : config().localization.impersonateUser

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent class="grid h-[min(52rem,calc(100vh-2rem))] max-w-[calc(100vw-2rem)]! grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-xl border bg-popover p-0 sm:max-w-[56rem]!">
          <DialogHeader class="border-b px-6 py-5 pr-14">
            <Show
              fallback={
                <>
                  <DialogTitle>{config().localization.userDetails}</DialogTitle>
                  <DialogDescription>
                    {config().localization.usersDescription}
                  </DialogDescription>
                </>
              }
              when={detail()}
            >
              {(selectedUser) => (
                <div class="flex items-center justify-between gap-4">
                  <div class="flex min-w-0 items-center gap-3">
                    <UserAvatar class="size-12" user={selectedUser()} />
                    <div class="min-w-0">
                      <DialogTitle class="truncate">
                        {selectedUser().name}
                      </DialogTitle>
                      <DialogDescription class="truncate">
                        {selectedUser().email}
                      </DialogDescription>
                    </div>
                  </div>
                  <div class="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={
                        selectedUser().banned ? "destructive" : "secondary"
                      }
                    >
                      {selectedUser().banned
                        ? config().localization.banned
                        : config().localization.active}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={config().localization.moreActions}
                        as={Button}
                        class=""
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Ellipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            disabled={
                              canImpersonate.isPending ||
                              !canImpersonate.data?.success ||
                              (targetIsAdmin() &&
                                (canImpersonateAdmins.isPending ||
                                  !canImpersonateAdmins.data?.success)) ||
                              isSelf()
                            }
                            onSelect={() => setDangerousAction("impersonate")}
                          >
                            <LogIn />
                            {config().localization.impersonateUser}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
            </Show>
          </DialogHeader>
          <Show
            fallback={
              <AdminMessage
                title={config().localization.loadUsersError}
                description={config().localization.loadUsersErrorDescription}
              />
            }
            when={!user.isError}
          >
            <Show
              fallback={<Skeleton class="mt-4 h-40 w-full" />}
              when={detail()}
            >
              {(selectedUser) => (
                <Tabs
                  class="min-h-0 gap-0 overflow-hidden"
                  defaultValue="overview"
                >
                  <TabsList class="mx-6 h-11 shrink-0" variant="line">
                    <TabsTrigger value="overview">
                      {config().localization.overview}
                    </TabsTrigger>
                    <TabsTrigger
                      disabled={
                        sessionsPermission.isPending ||
                        !sessionsPermission.data?.success
                      }
                      value="sessions"
                    >
                      {config().localization.sessions}
                    </TabsTrigger>
                    <For each={contributedTabs()}>
                      {(tab) => (
                        <TabsTrigger value={tab.value}>
                          <Dynamic component={tab.label} />
                        </TabsTrigger>
                      )}
                    </For>
                  </TabsList>
                  <TabsContent class="min-h-0 overflow-hidden" value="overview">
                    <profileForm.AppForm>
                      <profileForm.AuthFormRoot class="grid h-full grid-rows-[minmax(0,1fr)_auto]">
                        <div class="overflow-y-auto">
                          <section class="flex flex-col gap-5 p-6">
                            <h3 class="font-medium">
                              {config().localization.profileAndAccess}
                            </h3>
                            <FieldGroup class="grid gap-5 md:grid-cols-2">
                              <profileForm.Field name="name">
                                {(field) => (
                                  <Field>
                                    <FieldLabel for="solid-admin-user-name">
                                      {config().localization.name}
                                    </FieldLabel>
                                    <Input
                                      disabled={!canUpdate.data?.success}
                                      id="solid-admin-user-name"
                                      name={field().name}
                                      value={field().state.value}
                                      onInput={(event) =>
                                        field().handleChange(
                                          event.currentTarget.value
                                        )
                                      }
                                    />
                                  </Field>
                                )}
                              </profileForm.Field>
                              <profileForm.Field name="email">
                                {(field) => (
                                  <Field>
                                    <FieldLabel for="solid-admin-user-email">
                                      {config().localization.email}
                                    </FieldLabel>
                                    <Input
                                      disabled={
                                        !canUpdate.data?.success ||
                                        !canSetEmail.data?.success
                                      }
                                      id="solid-admin-user-email"
                                      name={field().name}
                                      onInput={(event) =>
                                        field().handleChange(
                                          event.currentTarget.value
                                        )
                                      }
                                      required
                                      type="email"
                                      value={field().state.value}
                                    />
                                  </Field>
                                )}
                              </profileForm.Field>
                              <profileForm.Field name="emailVerified">
                                {(field) => (
                                  <Field orientation="horizontal">
                                    <Switch
                                      checked={field().state.value}
                                      disabled={
                                        !canUpdate.data?.success ||
                                        !canSetEmail.data?.success
                                      }
                                      id="solid-admin-user-email-verified"
                                      onChange={field().handleChange}
                                    />
                                    <FieldContent>
                                      <FieldLabel for="solid-admin-user-email-verified">
                                        {config().localization.emailVerified}
                                      </FieldLabel>
                                    </FieldContent>
                                  </Field>
                                )}
                              </profileForm.Field>
                              <profileForm.Field name="roles">
                                {(field) => (
                                  <FieldSet>
                                    <FieldLegend variant="label">
                                      {config().localization.role}
                                    </FieldLegend>
                                    <Show
                                      when={config().allowMultipleRoles}
                                      fallback={
                                        <RadioGroup
                                          class="flex-row flex-wrap gap-4"
                                          disabled={
                                            isSelf() ||
                                            !canSetRole.data?.success
                                          }
                                          onChange={(role) =>
                                            field().handleChange([role])
                                          }
                                          value={field().state.value[0] ?? ""}
                                        >
                                          <For each={config().roles}>
                                            {(item) => (
                                              <Field orientation="horizontal">
                                                <RadioGroupItem
                                                  id={`solid-admin-user-role-${item}`}
                                                  value={item}
                                                />
                                                <FieldLabel
                                                  for={`solid-admin-user-role-${item}`}
                                                >
                                                  {item}
                                                </FieldLabel>
                                              </Field>
                                            )}
                                          </For>
                                        </RadioGroup>
                                      }
                                    >
                                      <FieldGroup
                                        class="flex-row flex-wrap gap-4"
                                        data-slot="checkbox-group"
                                      >
                                        <For each={config().roles}>
                                          {(item) => (
                                            <Field orientation="horizontal">
                                              <Checkbox
                                                checked={field().state.value.includes(
                                                  item
                                                )}
                                                disabled={
                                                  isSelf() ||
                                                  !canSetRole.data?.success
                                                }
                                                id={`solid-admin-user-role-${item}`}
                                                onChange={(checked) => {
                                                  const next = checked
                                                    ? [
                                                        ...field().state.value,
                                                        item
                                                      ]
                                                    : field().state.value.filter(
                                                        (role) => role !== item
                                                      )
                                                  if (next.length)
                                                    field().handleChange(next)
                                                }}
                                              />
                                              <FieldLabel
                                                for={`solid-admin-user-role-${item}`}
                                              >
                                                {item}
                                              </FieldLabel>
                                            </Field>
                                          )}
                                        </For>
                                      </FieldGroup>
                                    </Show>
                                  </FieldSet>
                                )}
                              </profileForm.Field>
                              <For each={configuredUserFields()}>
                                {(configuredField) => (
                                  <profileForm.AppField
                                    name={`additionalFields.${configuredField.name}`}
                                    validators={getAuthAdditionalFieldValidators(
                                      configuredField,
                                      auth.localization.auth.fieldRequired
                                    )}
                                  >
                                    {(field) => (
                                      <field.AuthFormAdditionalField
                                        field={configuredField}
                                        isPending={
                                          updateUser.isPending ||
                                          !canUpdate.data?.success
                                        }
                                      />
                                    )}
                                  </profileForm.AppField>
                                )}
                              </For>
                            </FieldGroup>
                            <FieldError>
                              {getAdminErrorMessage(updateUser.error) ??
                                getAdminErrorMessage(setRoleMutation.error)}
                            </FieldError>
                          </section>
                          <Separator />
                          <section class="flex flex-col gap-4 p-6">
                            <h3 class="font-medium">
                              {config().localization.accountInformation}
                            </h3>
                            <dl class="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                              <div class="flex flex-col gap-1">
                                <dt class="text-muted-foreground">
                                  {config().localization.userId}
                                </dt>
                                <dd class="flex min-w-0 items-center gap-1">
                                  <code class="truncate text-xs">
                                    {selectedUser().id}
                                  </code>
                                  <Button
                                    aria-label={
                                      config().localization.copyUserId
                                    }
                                    size="icon-xs"
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        selectedUser().id
                                      )
                                    }
                                  >
                                    <Copy />
                                  </Button>
                                </dd>
                              </div>
                              <div class="flex flex-col gap-1">
                                <dt class="text-muted-foreground">
                                  {config().localization.created}
                                </dt>
                                <dd>{formatDate(selectedUser().createdAt)}</dd>
                              </div>
                              <div class="flex flex-col gap-1">
                                <dt class="text-muted-foreground">
                                  {config().localization.status}
                                </dt>
                                <dd>
                                  <Badge
                                    variant={
                                      selectedUser().banned
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {selectedUser().banned
                                      ? config().localization.banned
                                      : config().localization.active}
                                  </Badge>
                                </dd>
                              </div>
                              <Show
                                when={
                                  selectedUser().banned &&
                                  selectedUser().banReason
                                }
                              >
                                <div class="flex flex-col gap-1">
                                  <dt class="text-muted-foreground">
                                    {config().localization.banReason}
                                  </dt>
                                  <dd>{selectedUser().banReason}</dd>
                                </div>
                              </Show>
                              <Show
                                when={
                                  selectedUser().banned &&
                                  selectedUser().banExpires
                                }
                              >
                                <div class="flex flex-col gap-1">
                                  <dt class="text-muted-foreground">
                                    {config().localization.banExpires}
                                  </dt>
                                  <dd>
                                    {formatDate(selectedUser().banExpires)}
                                  </dd>
                                </div>
                              </Show>
                            </dl>
                          </section>
                          <Separator />
                          <section class="flex flex-col gap-4 p-6">
                            <h3 class="font-medium">
                              {config().localization.security}
                            </h3>
                            <div>
                              <Button
                                disabled={
                                  canSetPassword.isPending ||
                                  !canSetPassword.data?.success
                                }
                                type="button"
                                variant="outline"
                                onClick={() => setPasswordOpen(true)}
                              >
                                <KeyRound />
                                {config().localization.setPassword}
                              </Button>
                            </div>
                          </section>
                          <Separator />
                          <section class="flex flex-col gap-4 p-6">
                            <h3 class="font-medium">
                              {config().localization.dangerZone}
                            </h3>
                            <div class="flex flex-wrap gap-2">
                              <Button
                                disabled={
                                  canBan.isPending ||
                                  !canBan.data?.success ||
                                  isSelf()
                                }
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  selectedUser().banned
                                    ? unban.mutate({
                                        userId: selectedUser().id
                                      })
                                    : setDangerousAction("ban")
                                }
                              >
                                <Ban />
                                {selectedUser().banned
                                  ? config().localization.unbanUser
                                  : config().localization.banUser}
                              </Button>
                              <Button
                                disabled={
                                  canDelete.isPending ||
                                  !canDelete.data?.success ||
                                  isSelf()
                                }
                                type="button"
                                variant="destructive"
                                onClick={() => setDangerousAction("delete")}
                              >
                                <Trash2 />
                                {config().localization.deleteUser}
                              </Button>
                            </div>
                            <FieldError>
                              {getAdminErrorMessage(unban.error)}
                            </FieldError>
                          </section>
                        </div>
                        <div class="flex flex-col-reverse gap-2 border-t bg-muted/50 px-6 py-4 sm:flex-row sm:justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => props.onOpenChange(false)}
                          >
                            {config().localization.cancel}
                          </Button>
                          <profileForm.Subscribe
                            selector={(state) =>
                              [state.values.name, state.values.email] as const
                            }
                          >
                            {(values) => (
                              <profileForm.AuthFormSubmitButton
                                disabled={
                                  !values()[0].trim() ||
                                  !values()[1].trim() ||
                                  updateUser.isPending ||
                                  setRoleMutation.isPending ||
                                  canUpdate.isPending ||
                                  canSetRole.isPending ||
                                  (!canUpdate.data?.success &&
                                    (!canSetRole.data?.success || isSelf()))
                                }
                              >
                                {config().localization.saveChanges}
                              </profileForm.AuthFormSubmitButton>
                            )}
                          </profileForm.Subscribe>
                        </div>
                      </profileForm.AuthFormRoot>
                    </profileForm.AppForm>
                  </TabsContent>
                  <TabsContent
                    class="flex min-h-0 flex-col gap-3 overflow-y-auto p-6"
                    value="sessions"
                  >
                    <Show
                      fallback={<SessionRowsSkeleton />}
                      when={
                        !sessionsPermission.isPending &&
                        (!sessionsPermission.data?.success ||
                          !sessions.isPending)
                      }
                    >
                      <Show
                        fallback={
                          <p class="py-8 text-center text-sm text-muted-foreground">
                            {config().localization.accessDeniedDescription}
                          </p>
                        }
                        when={sessionsPermission.data?.success}
                      >
                        <Show
                          fallback={
                            <p class="py-8 text-center text-sm text-muted-foreground">
                              {config().localization.noSessions}
                            </p>
                          }
                          when={sessions.data?.sessions.length}
                        >
                          <Button
                            class="self-end"
                            disabled={
                              canRevoke.isPending ||
                              !canRevoke.data?.success ||
                              isSelf()
                            }
                            variant="outline"
                            onClick={() => setDangerousAction("revokeAll")}
                          >
                            {config().localization.revokeAllSessions}
                          </Button>
                          <For each={sessions.data?.sessions}>
                            {(session) => (
                              <div class="flex items-start justify-between gap-3 rounded-lg border p-3">
                                <div class="min-w-0">
                                  <div class="truncate text-sm font-medium">
                                    {session.userAgent ||
                                      config().localization.sessions}
                                  </div>
                                  <div class="text-xs text-muted-foreground">
                                    {formatDate(session.createdAt)} ·{" "}
                                    {formatDate(session.expiresAt)}
                                  </div>
                                  <Show
                                    when={
                                      config().showIpAddress &&
                                      session.ipAddress
                                    }
                                  >
                                    <div class="mt-1 font-mono text-xs text-muted-foreground">
                                      {session.ipAddress}
                                    </div>
                                  </Show>
                                </div>
                                <Button
                                  aria-label={config().localization.revoke}
                                  disabled={
                                    revokeSession.isPending ||
                                    canRevoke.isPending ||
                                    !canRevoke.data?.success ||
                                    isSelf()
                                  }
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() =>
                                    revokeSession.mutate({
                                      sessionToken: session.token
                                    })
                                  }
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            )}
                          </For>
                        </Show>
                      </Show>
                    </Show>
                  </TabsContent>
                  <For each={contributedTabs()}>
                    {(tab) => (
                      <TabsContent
                        class="min-h-0 overflow-y-auto p-6"
                        value={tab.value}
                      >
                        <Dynamic
                          component={tab.component}
                          userId={selectedUser().id}
                        />
                      </TabsContent>
                    )}
                  </For>
                </Tabs>
              )}
            </Show>
          </Show>
        </DialogContent>
      </Dialog>
      <PasswordDialog
        open={passwordOpen()}
        onOpenChange={setPasswordOpen}
        userId={detail()?.id}
      />
      <AlertDialog
        open={Boolean(dangerousAction())}
        onOpenChange={(open) => !open && closeDangerousAction()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dangerousLabel()}</AlertDialogTitle>
            <AlertDialogDescription>{detail()?.email}</AlertDialogDescription>
          </AlertDialogHeader>
          <Show when={dangerousAction() === "ban"}>
            <FieldGroup>
              <Field>
                <FieldLabel for="solid-admin-ban-reason">
                  {config().localization.banReason}
                </FieldLabel>
                <Input
                  id="solid-admin-ban-reason"
                  onInput={(event) => setBanReason(event.currentTarget.value)}
                  value={banReason()}
                />
              </Field>
              <Field>
                <FieldLabel for="solid-admin-ban-duration">
                  {config().localization.banDuration}
                </FieldLabel>
                <Input
                  id="solid-admin-ban-duration"
                  min="1"
                  onInput={(event) => setBanDuration(event.currentTarget.value)}
                  step="1"
                  type="number"
                  value={banDuration()}
                />
                <p class="text-xs text-muted-foreground">
                  {config().localization.banDurationDescription}
                </p>
              </Field>
            </FieldGroup>
          </Show>
          <Show when={dangerousMutation().error}>
            <FieldError>
              {getAdminErrorMessage(dangerousMutation().error)}
            </FieldError>
          </Show>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {config().localization.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={
                isSelf() ||
                dangerousMutation().isPending ||
                (dangerousAction() === "ban" && banDurationSeconds() === null)
              }
              variant={
                dangerousAction() === "delete" ? "destructive" : "default"
              }
              onClick={(event: MouseEvent) => {
                event.preventDefault()
                confirmDangerousAction()
              }}
            >
              {dangerousLabel()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function PasswordDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
}) {
  const auth = useAuth()
  const authClient = auth.authClient as AdminAuthClient
  const config = () =>
    (auth.plugins.find((plugin) => plugin.id === adminPlugin.id) ??
      adminPlugin()) as ReturnType<typeof adminPlugin>
  const setPasswordMutation = useSetAdminUserPassword(authClient)

  const form = createAuthForm(() => ({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      if (!props.userId) return
      await setPasswordMutation.mutateAsync({
        userId: props.userId,
        newPassword: value.password
      })
      close()
    }
  }))
  const close = () => {
    form.reset()
    setPasswordMutation.reset()
    props.onOpenChange(false)
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => (open ? props.onOpenChange(true) : close())}
    >
      <DialogContent>
        <form.AppForm>
          <form.AuthFormRoot class="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{config().localization.setPassword}</DialogTitle>
              <DialogDescription>
                {config().localization.userDetails}
              </DialogDescription>
            </DialogHeader>
            <form.AppField
              name="password"
              validators={{
                onChange: ({ value }) =>
                  value ? undefined : config().localization.password
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  autocomplete="new-password"
                  id="solid-admin-new-password"
                  label={config().localization.password}
                  type="password"
                />
              )}
            </form.AppField>
            <form.AuthFormServerError />
            <DialogFooter>
              <Button onClick={close} type="button" variant="outline">
                {config().localization.cancel}
              </Button>
              <form.AuthFormSubmitButton
                disabled={setPasswordMutation.isPending || !props.userId}
              >
                {config().localization.setPassword}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
