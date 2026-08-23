import {
  type AdditionalFieldValue,
  parseAdditionalFieldValues
} from "@better-auth-ui/core"
import {
  type AdminAuthClient,
  type AdminListUsersParams,
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
import { createDebounce } from "@solid-primitives/debounce"
import { Ban, KeyRound, LogIn, Search, Trash2, UserPlus } from "lucide-solid"
import { createEffect, createMemo, createSignal, For, on, Show } from "solid-js"
import { Dynamic } from "solid-js/web"

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

import { AdditionalField } from "../additional-field"
import { UserAvatar } from "../user/user-avatar"

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

const parseAdminRoles = (role: string | undefined, fallback: string) => {
  const roles = role
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  return roles?.length ? roles : [fallback]
}

const getBanDurationSeconds = (value: string) => {
  if (!value) return undefined
  const days = Number(value)
  if (!Number.isSafeInteger(days) || days <= 0) return null
  const seconds = days * 86_400
  return Number.isSafeInteger(seconds) ? seconds : null
}

const getAdminErrorMessage = (error: Error | null) => error?.message

/** Zaidan presentation for the static Admin users view. */
export function AdminUsers(props: AdminUsersProps) {
  const auth = useAuth()
  const authClient = auth.authClient as AdminAuthClient
  const defaults = adminPlugin()
  const config = () =>
    (auth.plugins.find((plugin) => plugin.id === adminPlugin.id) ??
      defaults) as typeof defaults
  const [localSelectedUserId, setLocalSelectedUserId] = createSignal<string>()
  const [page, setPage] = createSignal(0)
  const [search, setSearch] = createSignal("")
  const [debouncedSearch, setDebouncedSearch] = createSignal("")
  const [searchField, setSearchField] = createSignal<"email" | "name">("email")
  const [searchOperator, setSearchOperator] =
    createSignal<SearchOperator>("contains")
  const [sort, setSort] = createSignal<SortOption>("createdAt-desc")
  const [status, setStatus] = createSignal<StatusFilter>("all")
  const updateDebouncedSearch = createDebounce(setDebouncedSearch, 300)
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
      limit: config().pageSize,
      offset: page() * config().pageSize,
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
            setPage(0)
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
            setPage(0)
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
              const value = event.currentTarget.value
              setSearch(value)
              setPage(0)
              updateDebouncedSearch(value.trim())
            }}
            placeholder={
              searchField() === "email"
                ? config().localization.searchByEmail
                : config().localization.searchByName
            }
            value={search()}
          />
        </InputGroup>
        <select
          aria-label={config().localization.status}
          class="h-8 rounded-lg border bg-transparent px-2 text-sm"
          onChange={(event) => {
            setStatus(event.currentTarget.value as StatusFilter)
            setPage(0)
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
            setSort(event.currentTarget.value as SortOption)
            setPage(0)
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
                      when={users.data?.users.length}
                    >
                      <For each={users.data?.users}>
                        {(user) => (
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
                                      <span class="truncate">{user.name}</span>
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
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                          </TableRow>
                        )}
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
              String(total() ? page() * config().pageSize + 1 : 0)
            )
            .replace(
              "{{to}}",
              String(Math.min(total(), (page() + 1) * config().pageSize))
            )
            .replace("{{total}}", String(total()))}
        </span>
        <div class="flex gap-2">
          <Button
            disabled={page() === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            variant="outline"
          >
            {config().localization.previousPage}
          </Button>
          <Button
            disabled={(page() + 1) * config().pageSize >= total()}
            onClick={() => setPage((value) => value + 1)}
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
  const [emailVerified, setEmailVerified] = createSignal(false)
  const [formError, setFormError] = createSignal<string>()
  const [roles, setRoles] = createSignal([config().defaultRole])

  const close = () => {
    createUser.reset()
    setEmailVerified(false)
    setFormError(undefined)
    setRoles([config().defaultRole])
    props.onOpenChange(false)
  }
  const submit = async (event: SubmitEvent) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget as HTMLFormElement)
    let additionalFieldValues: Record<string, AdditionalFieldValue | null>
    try {
      additionalFieldValues = await parseAdditionalFieldValues(
        auth.additionalFields ?? [],
        data
      )
    } catch (error) {
      setFormError(error instanceof Error ? error.message : String(error))
      return
    }
    setFormError(undefined)
    createUser.mutate(
      {
        data: { ...additionalFieldValues, emailVerified: emailVerified() },
        email: String(data.get("email")),
        name: String(data.get("name")),
        password: String(data.get("password")),
        ...(canSetRole.data?.success ? { role: asAdminRoles(roles()) } : {})
      },
      { onSuccess: close }
    )
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => (open ? props.onOpenChange(true) : close())}
    >
      <DialogContent>
        <form class="flex flex-col gap-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{config().localization.createUser}</DialogTitle>
            <DialogDescription>
              {config().localization.usersDescription}
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel for="solid-admin-create-name">
              {config().localization.name}
            </FieldLabel>
            <Input id="solid-admin-create-name" name="name" required />
          </Field>
          <Field>
            <FieldLabel for="solid-admin-create-email">
              {config().localization.email}
            </FieldLabel>
            <Input
              autocomplete="off"
              id="solid-admin-create-email"
              name="email"
              required
              type="email"
            />
          </Field>
          <Field>
            <FieldLabel for="solid-admin-create-password">
              {config().localization.password}
            </FieldLabel>
            <Input
              autocomplete="new-password"
              id="solid-admin-create-password"
              name="password"
              required
              type="password"
            />
          </Field>
          <Show
            fallback={
              <Show when={canSetRole.isPending}>
                <Skeleton class="h-16 w-full" />
              </Show>
            }
            when={canSetRole.data?.success}
          >
            <FieldSet>
              <FieldLegend variant="label">
                {config().localization.role}
              </FieldLegend>
              <FieldGroup data-slot="checkbox-group">
                <For each={config().roles}>
                  {(role) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        checked={roles().includes(role)}
                        id={`solid-admin-create-role-${role}`}
                        onChange={(checked) => {
                          const next = checked
                            ? [...roles(), role]
                            : roles().filter((item) => item !== role)
                          if (next.length) setRoles(next)
                        }}
                      />
                      <FieldLabel for={`solid-admin-create-role-${role}`}>
                        {role}
                      </FieldLabel>
                    </Field>
                  )}
                </For>
              </FieldGroup>
            </FieldSet>
          </Show>
          <Field orientation="horizontal">
            <Switch
              checked={emailVerified()}
              id="solid-admin-create-email-verified"
              onChange={setEmailVerified}
            />
            <FieldContent>
              <FieldLabel for="solid-admin-create-email-verified">
                {config().localization.emailVerified}
              </FieldLabel>
            </FieldContent>
          </Field>
          <For each={auth.additionalFields}>
            {(field) => (
              <AdditionalField
                field={field}
                isPending={createUser.isPending}
                name={field.name}
              />
            )}
          </For>
          <FieldError>
            {formError() ?? getAdminErrorMessage(createUser.error)}
          </FieldError>
          <DialogFooter>
            <Button onClick={close} type="button" variant="outline">
              {config().localization.cancel}
            </Button>
            <Button disabled={createUser.isPending} type="submit">
              {config().localization.createUser}
            </Button>
          </DialogFooter>
        </form>
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
  const [name, setName] = createSignal("")
  const [email, setEmail] = createSignal("")
  const [emailVerified, setEmailVerified] = createSignal(false)
  const [roles, setRoles] = createSignal([config().defaultRole])
  const [banReason, setBanReason] = createSignal("")
  const [banDuration, setBanDuration] = createSignal("")
  const banDurationSeconds = createMemo(() =>
    getBanDurationSeconds(banDuration())
  )
  const [profileError, setProfileError] = createSignal<string>()
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

  createEffect(
    on(
      () =>
        [
          detail()?.email,
          detail()?.emailVerified,
          detail()?.id,
          detail()?.name,
          detail()?.role
        ] as const,
      ([userEmail, userEmailVerified, _userId, userName, userRole]) => {
        setName(userName ?? "")
        setEmail(userEmail ?? "")
        setEmailVerified(userEmailVerified ?? false)
        setRoles(parseAdminRoles(userRole, config().defaultRole))
        setProfileError(undefined)
      }
    )
  )

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
        <DialogContent class="max-h-[90vh] max-w-lg overflow-y-auto rounded-xl border bg-popover p-4">
          <DialogHeader>
            <DialogTitle>{config().localization.userDetails}</DialogTitle>
            <DialogDescription>
              {detail()?.email ?? config().localization.usersDescription}
            </DialogDescription>
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
                <Tabs class="mt-4" defaultValue="overview">
                  <TabsList>
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
                  <TabsContent
                    class="flex flex-col gap-6 pt-4"
                    value="overview"
                  >
                    <div class="flex items-center gap-3">
                      <UserAvatar class="size-12" user={selectedUser()} />
                      <div>
                        <div class="font-medium">{selectedUser().name}</div>
                        <div class="text-sm text-muted-foreground">
                          {selectedUser().email}
                        </div>
                      </div>
                    </div>
                    <dl class="grid grid-cols-[auto_1fr] gap-3 text-sm">
                      <dt class="text-muted-foreground">
                        {config().localization.userId}
                      </dt>
                      <dd class="font-mono text-xs">{selectedUser().id}</dd>
                      <dt class="text-muted-foreground">
                        {config().localization.created}
                      </dt>
                      <dd>{formatDate(selectedUser().createdAt)}</dd>
                      <dt class="text-muted-foreground">
                        {config().localization.status}
                      </dt>
                      <dd>
                        <Badge
                          variant={
                            selectedUser().banned ? "destructive" : "secondary"
                          }
                        >
                          {selectedUser().banned
                            ? config().localization.banned
                            : config().localization.active}
                        </Badge>
                      </dd>
                      <Show
                        when={selectedUser().banned && selectedUser().banReason}
                      >
                        <dt class="text-muted-foreground">
                          {config().localization.banReason}
                        </dt>
                        <dd>{selectedUser().banReason}</dd>
                      </Show>
                      <Show
                        when={
                          selectedUser().banned && selectedUser().banExpires
                        }
                      >
                        <dt class="text-muted-foreground">
                          {config().localization.banExpires}
                        </dt>
                        <dd>{formatDate(selectedUser().banExpires)}</dd>
                      </Show>
                    </dl>
                    <form
                      class="flex flex-col gap-4"
                      onSubmit={async (event) => {
                        event.preventDefault()
                        const formData = new FormData(event.currentTarget)
                        let additionalFieldValues: Record<
                          string,
                          AdditionalFieldValue | null
                        >
                        try {
                          additionalFieldValues =
                            await parseAdditionalFieldValues(
                              auth.additionalFields ?? [],
                              formData
                            )
                        } catch (error) {
                          setProfileError(
                            error instanceof Error
                              ? error.message
                              : String(error)
                          )
                          return
                        }
                        setProfileError(undefined)
                        updateUser.mutate({
                          userId: selectedUser().id,
                          data: {
                            ...additionalFieldValues,
                            name: name().trim(),
                            ...(canSetEmail.data?.success
                              ? {
                                  email: email().trim(),
                                  emailVerified: emailVerified()
                                }
                              : {})
                          }
                        })
                      }}
                    >
                      <Field>
                        <FieldLabel for="solid-admin-user-name">
                          {config().localization.name}
                        </FieldLabel>
                        <Input
                          disabled={!canUpdate.data?.success}
                          id="solid-admin-user-name"
                          value={name()}
                          onInput={(event) =>
                            setName(event.currentTarget.value)
                          }
                        />
                      </Field>
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
                          onInput={(event) =>
                            setEmail(event.currentTarget.value)
                          }
                          required
                          type="email"
                          value={email()}
                        />
                      </Field>
                      <Field orientation="horizontal">
                        <Switch
                          checked={emailVerified()}
                          disabled={
                            !canUpdate.data?.success ||
                            !canSetEmail.data?.success
                          }
                          id="solid-admin-user-email-verified"
                          onChange={setEmailVerified}
                        />
                        <FieldContent>
                          <FieldLabel for="solid-admin-user-email-verified">
                            {config().localization.emailVerified}
                          </FieldLabel>
                        </FieldContent>
                      </Field>
                      <For each={auth.additionalFields}>
                        {(field) => {
                          const value = () =>
                            (
                              selectedUser() as unknown as Record<
                                string,
                                unknown
                              >
                            )[field.name]
                          return (
                            <AdditionalField
                              field={{
                                ...field,
                                defaultValue:
                                  value() as AdditionalFieldValue | null
                              }}
                              isPending={
                                updateUser.isPending || !canUpdate.data?.success
                              }
                              name={field.name}
                            />
                          )
                        }}
                      </For>
                      <FieldError>
                        {profileError() ??
                          getAdminErrorMessage(updateUser.error)}
                      </FieldError>
                      <Button
                        class="self-start"
                        disabled={
                          !name().trim() ||
                          !email().trim() ||
                          updateUser.isPending ||
                          canUpdate.isPending ||
                          !canUpdate.data?.success
                        }
                        type="submit"
                        variant="outline"
                      >
                        {config().localization.saveUser}
                      </Button>
                    </form>
                    <div class="flex flex-col gap-3">
                      <FieldSet>
                        <FieldLegend variant="label">
                          {config().localization.role}
                        </FieldLegend>
                        <FieldGroup data-slot="checkbox-group">
                          <For each={config().roles}>
                            {(item) => (
                              <Field orientation="horizontal">
                                <Checkbox
                                  checked={roles().includes(item)}
                                  disabled={
                                    isSelf() || !canSetRole.data?.success
                                  }
                                  id={`solid-admin-user-role-${item}`}
                                  onChange={(checked) => {
                                    const next = checked
                                      ? [...roles(), item]
                                      : roles().filter((role) => role !== item)
                                    if (next.length) setRoles(next)
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
                      </FieldSet>
                      <Button
                        class="self-start"
                        disabled={
                          setRoleMutation.isPending ||
                          canSetRole.isPending ||
                          !canSetRole.data?.success ||
                          isSelf()
                        }
                        variant="outline"
                        onClick={() =>
                          setRoleMutation.mutate({
                            userId: selectedUser().id,
                            role: asAdminRoles(roles())
                          })
                        }
                      >
                        {config().localization.saveRole}
                      </Button>
                    </div>
                    <FieldError>
                      {getAdminErrorMessage(setRoleMutation.error)}
                    </FieldError>
                    <div class="flex flex-wrap gap-2">
                      <Button
                        disabled={
                          canSetPassword.isPending ||
                          !canSetPassword.data?.success
                        }
                        variant="outline"
                        onClick={() => setPasswordOpen(true)}
                      >
                        <KeyRound />
                        {config().localization.setPassword}
                      </Button>
                      <Button
                        disabled={
                          canBan.isPending || !canBan.data?.success || isSelf()
                        }
                        variant="outline"
                        onClick={() =>
                          selectedUser().banned
                            ? unban.mutate({ userId: selectedUser().id })
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
                          canImpersonate.isPending ||
                          !canImpersonate.data?.success ||
                          (targetIsAdmin() &&
                            (canImpersonateAdmins.isPending ||
                              !canImpersonateAdmins.data?.success)) ||
                          isSelf()
                        }
                        variant="outline"
                        onClick={() => setDangerousAction("impersonate")}
                      >
                        <LogIn />
                        {config().localization.impersonateUser}
                      </Button>
                      <Button
                        disabled={
                          canDelete.isPending ||
                          !canDelete.data?.success ||
                          isSelf()
                        }
                        variant="destructive"
                        onClick={() => setDangerousAction("delete")}
                      >
                        <Trash2 />
                        {config().localization.deleteUser}
                      </Button>
                    </div>
                    <FieldError>{getAdminErrorMessage(unban.error)}</FieldError>
                  </TabsContent>
                  <TabsContent
                    class="flex flex-col gap-3 pt-4"
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
                      <TabsContent class="pt-4" value={tab.value}>
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
          <DialogFooter showCloseButton />
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
  const [password, setPassword] = createSignal("")
  const [errorMessage, setErrorMessage] = createSignal<string>()
  const setPasswordMutation = useSetAdminUserPassword(authClient)

  const close = () => {
    setPassword("")
    setErrorMessage(undefined)
    setPasswordMutation.reset()
    props.onOpenChange(false)
  }
  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    setErrorMessage(undefined)
    if (props.userId)
      setPasswordMutation.mutate(
        { userId: props.userId, newPassword: password() },
        {
          onError: (error) => setErrorMessage(getAdminErrorMessage(error)),
          onSuccess: close
        }
      )
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => (open ? props.onOpenChange(true) : close())}
    >
      <DialogContent>
        <form class="flex flex-col gap-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{config().localization.setPassword}</DialogTitle>
            <DialogDescription>
              {config().localization.userDetails}
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(errorMessage())}>
            <FieldLabel for="solid-admin-new-password">
              {config().localization.password}
            </FieldLabel>
            <Input
              aria-invalid={Boolean(errorMessage())}
              autocomplete="new-password"
              id="solid-admin-new-password"
              required
              type="password"
              value={password()}
              onInput={(event) => setPassword(event.currentTarget.value)}
            />
            <FieldError>{errorMessage()}</FieldError>
          </Field>
          <DialogFooter>
            <Button onClick={close} type="button" variant="outline">
              {config().localization.cancel}
            </Button>
            <Button
              disabled={!password() || setPasswordMutation.isPending}
              type="submit"
            >
              {config().localization.setPassword}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
