"use client"

import {
  type AdminAuthClient,
  type AdminListUsersParams,
  banAdminUserOptions,
  createAdminUserOptions,
  impersonateAdminUserOptions,
  removeAdminUserOptions,
  revokeAdminUserSessionOptions,
  revokeAdminUserSessionsOptions,
  setAdminUserPasswordOptions,
  setAdminUserRoleOptions,
  unbanAdminUserOptions
} from "@better-auth-ui/core/plugins/admin"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useAdminPermission,
  useAdminUser,
  useAdminUserSessions,
  useAdminUsers
} from "@better-auth-ui/react/plugins/admin"
import { keepPreviousData, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import {
  BanIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  KeyRoundIcon,
  LogInIcon,
  SearchIcon,
  ShieldAlertIcon,
  Trash2Icon,
  UserPlusIcon
} from "lucide-react"
import {
  type FormEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useState
} from "react"
import { UserAvatar } from "@/components/auth/user/user-avatar"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminPlugin } from "@/lib/auth/admin-plugin"

type SearchField = "email" | "name"
type StatusFilter = "all" | "active" | "banned"
type SortDirection = "asc" | "desc"
type DangerousAction = "ban" | "delete" | "impersonate" | "revokeAll"

export type AdminUsersProps = {
  className?: string
  onSelectedUserIdChange?: (userId: string | undefined) => void
  selectedUserId?: string
}

const formatDate = (value: Date | string | undefined | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "–"

const asAdminRole = (role: string) => role as "user" | "admin"

const getAdminErrorMessage = (error: Error | null) => {
  const authError = error as BetterFetchError | null
  return authError?.error?.message ?? authError?.message
}

/** Server-paginated user management with optional controlled inspector state. */
export function AdminUsers({
  className,
  onSelectedUserIdChange,
  selectedUserId: controlledSelectedUserId
}: AdminUsersProps) {
  const auth = useAuth<AdminAuthClient>()
  const config = useAuthPlugin(adminPlugin)
  const { localization } = config
  const [localSelectedUserId, setLocalSelectedUserId] = useState<string>()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [searchField, setSearchField] = useState<SearchField>("email")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [createOpen, setCreateOpen] = useState(false)
  const deferredSearch = useDeferredValue(search.trim())
  const isSelectionControlled = onSelectedUserIdChange !== undefined
  const selectedUserId = isSelectionControlled
    ? controlledSelectedUserId
    : localSelectedUserId

  const setSelectedUserId = (userId: string | undefined) => {
    if (!isSelectionControlled) setLocalSelectedUserId(userId)
    onSelectedUserIdChange?.(userId)
  }

  const params = useMemo<AdminListUsersParams>(
    () => ({
      limit: config.pageSize,
      offset: page * config.pageSize,
      searchField,
      searchOperator: "contains",
      searchValue: deferredSearch || undefined,
      sortBy,
      sortDirection,
      ...(status === "all"
        ? {}
        : {
            filterField: "banned",
            filterOperator: "eq" as const,
            filterValue: status === "banned"
          })
    }),
    [
      config.pageSize,
      deferredSearch,
      page,
      searchField,
      sortBy,
      sortDirection,
      status
    ]
  )
  const permission = useAdminPermission(auth.authClient, { user: ["list"] })
  const users = useAdminUsers(auth.authClient, {
    enabled: permission.data?.success === true,
    params,
    placeholderData: keepPreviousData
  })
  const canCreate = useAdminPermission(auth.authClient, { user: ["create"] })

  const changeSort = (field: string) => {
    setPage(0)
    if (sortBy === field) {
      setSortDirection((value) => (value === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  const total = users.data?.total ?? 0
  const from = total ? page * config.pageSize + 1 : 0
  const to = Math.min(total, (page + 1) * config.pageSize)

  return (
    <section className={className}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {localization.users}
            </h1>
            <p className="text-sm text-muted-foreground">
              {localization.usersDescription}
            </p>
          </div>
          {canCreate.isPending ? (
            <Skeleton className="h-8 w-28" />
          ) : canCreate.data?.success ? (
            <Button onClick={() => setCreateOpen(true)}>
              <UserPlusIcon />
              {localization.createUser}
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={searchField}
            onValueChange={(value) => {
              setSearchField(value as SearchField)
              setPage(0)
            }}
          >
            <SelectTrigger
              aria-label={localization.search}
              className="w-full sm:w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">{localization.email}</SelectItem>
              <SelectItem value="name">{localization.name}</SelectItem>
            </SelectContent>
          </Select>
          <InputGroup className="sm:max-w-md">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              aria-label={
                searchField === "email"
                  ? localization.searchByEmail
                  : localization.searchByName
              }
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(0)
              }}
              placeholder={
                searchField === "email"
                  ? localization.searchByEmail
                  : localization.searchByName
              }
              value={search}
            />
          </InputGroup>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as StatusFilter)
              setPage(0)
            }}
          >
            <SelectTrigger
              aria-label={localization.status}
              className="w-full sm:w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{localization.status}</SelectItem>
              <SelectItem value="active">{localization.active}</SelectItem>
              <SelectItem value="banned">{localization.banned}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {permission.isPending ? (
          <UserTableSkeleton />
        ) : !permission.data?.success ? (
          <AdminState
            icon={<ShieldAlertIcon />}
            title={localization.accessDenied}
            description={localization.accessDeniedDescription}
          />
        ) : users.isError ? (
          <AdminState
            icon={<ShieldAlertIcon />}
            title={localization.loadUsersError}
            description={localization.loadUsersErrorDescription}
            action={
              <Button variant="outline" onClick={() => users.refetch()}>
                {localization.retry}
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton
                      active={sortBy === "name"}
                      direction={sortDirection}
                      onClick={() => changeSort("name")}
                    >
                      {localization.name}
                    </SortButton>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <SortButton
                      active={sortBy === "role"}
                      direction={sortDirection}
                      onClick={() => changeSort("role")}
                    >
                      {localization.role}
                    </SortButton>
                  </TableHead>
                  <TableHead>{localization.status}</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <SortButton
                      active={sortBy === "createdAt"}
                      direction={sortDirection}
                      onClick={() => changeSort("createdAt")}
                    >
                      {localization.created}
                    </SortButton>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.isPending ? (
                  <UserRowsSkeleton />
                ) : users.data?.users.length ? (
                  users.data.users.map((user) => (
                    <TableRow
                      key={user.id}
                      aria-selected={selectedUserId === user.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar className="size-8" user={user} />
                          <div className="min-w-0">
                            <Button
                              className="h-auto min-w-0 justify-start p-0 font-medium"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedUserId(user.id)
                              }}
                              variant="link"
                            >
                              <span className="truncate">{user.name}</span>
                            </Button>
                            <div className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {user.role ?? config.defaultRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.banned ? "destructive" : "secondary"}
                        >
                          {user.banned
                            ? localization.banned
                            : localization.active}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {formatDate(user.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <strong className="block font-medium">
                        {localization.noUsers}
                      </strong>
                      <span className="text-muted-foreground">
                        {localization.noUsersDescription}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {localization.usersPaginationRange
              .replace("{{from}}", String(from))
              .replace("{{to}}", String(to))
              .replace("{{total}}", String(total))}
          </span>
          <div className="flex gap-1">
            <Button
              aria-label={localization.previousPage}
              disabled={page === 0 || users.isFetching}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              size="icon-sm"
              variant="outline"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              aria-label={localization.nextPage}
              disabled={to >= total || users.isFetching}
              onClick={() => setPage((value) => value + 1)}
              size="icon-sm"
              variant="outline"
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      </div>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <UserInspector
        open={Boolean(selectedUserId)}
        onOpenChange={(open) => !open && setSelectedUserId(undefined)}
        userId={selectedUserId}
      />
    </section>
  )
}

function SortButton({
  active,
  children,
  direction,
  onClick
}: {
  active: boolean
  children: React.ReactNode
  direction: SortDirection
  onClick: () => void
}) {
  return (
    <button
      className="inline-flex items-center gap-1 hover:text-foreground"
      onClick={onClick}
      type="button"
    >
      {children}
      {active ? (direction === "asc" ? "↑" : "↓") : null}
    </button>
  )
}

function AdminState({
  action,
  description,
  icon,
  title
}: {
  action?: React.ReactNode
  description: string
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <span className="text-muted-foreground [&>svg]:size-8">{icon}</span>
      <div className="flex flex-col gap-1">
        <h2 className="font-medium">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

const skeletonRowIds = [
  "admin-row-1",
  "admin-row-2",
  "admin-row-3",
  "admin-row-4",
  "admin-row-5"
]

function UserRowsSkeleton() {
  return skeletonRowIds.map((id) => (
    <TableRow key={id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-5 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  ))
}

function UserTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableBody>
          <UserRowsSkeleton />
        </TableBody>
      </Table>
    </div>
  )
}

function CreateUserDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth<AdminAuthClient>()
  const config = useAuthPlugin(adminPlugin)
  const { data: session } = useSession(auth.authClient)
  const [password, setPassword] = useState("")
  const createUser = useMutation(
    createAdminUserOptions(auth.authClient, session?.user.id)
  )

  const close = () => {
    setPassword("")
    createUser.reset()
    onOpenChange(false)
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    createUser.mutate(
      {
        email: String(data.get("email")),
        name: String(data.get("name")),
        password,
        role: asAdminRole(String(data.get("role") || config.defaultRole))
      },
      { onSuccess: close }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (value ? onOpenChange(true) : close())}
    >
      <DialogContent>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{config.localization.createUser}</DialogTitle>
            <DialogDescription>
              {config.localization.usersDescription}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="admin-create-name">
                {config.localization.name}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput id="admin-create-name" name="name" required />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-create-email">
                {config.localization.email}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  autoComplete="off"
                  id="admin-create-email"
                  name="email"
                  required
                  type="email"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-create-password">
                {config.localization.password}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  autoComplete="new-password"
                  id="admin-create-password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-create-role">
                {config.localization.role}
              </FieldLabel>
              <select
                className="h-8 rounded-lg border bg-transparent px-2 text-sm"
                defaultValue={config.defaultRole}
                id="admin-create-role"
                name="role"
              >
                {config.roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </Field>
          </FieldGroup>
          <FieldError>{getAdminErrorMessage(createUser.error)}</FieldError>
          <DialogFooter>
            <Button onClick={close} type="button" variant="outline">
              {config.localization.cancel}
            </Button>
            <Button disabled={createUser.isPending} type="submit">
              {config.localization.createUser}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UserInspector({
  open,
  onOpenChange,
  userId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
}) {
  const auth = useAuth<AdminAuthClient>()
  const config = useAuthPlugin(adminPlugin)
  const detail = useAdminUser(auth.authClient, userId)
  const sessionsPermission = useAdminPermission(
    auth.authClient,
    {
      session: ["list"]
    },
    { enabled: Boolean(userId) }
  )
  const sessions = useAdminUserSessions(auth.authClient, userId, {
    enabled: sessionsPermission.data?.success === true
  })
  const { data: actor } = useSession(auth.authClient)
  const canSetRole = useAdminPermission(
    auth.authClient,
    {
      user: ["set-role"]
    },
    { enabled: Boolean(userId) }
  )
  const canSetPassword = useAdminPermission(
    auth.authClient,
    {
      user: ["set-password"]
    },
    { enabled: Boolean(userId) }
  )
  const canBan = useAdminPermission(
    auth.authClient,
    { user: ["ban"] },
    { enabled: Boolean(userId) }
  )
  const canImpersonate = useAdminPermission(
    auth.authClient,
    {
      user: ["impersonate"]
    },
    { enabled: Boolean(userId) }
  )
  const canDelete = useAdminPermission(
    auth.authClient,
    { user: ["delete"] },
    { enabled: Boolean(userId) }
  )
  const canRevoke = useAdminPermission(
    auth.authClient,
    {
      session: ["revoke"]
    },
    { enabled: Boolean(userId) }
  )
  const [role, setRole] = useState(config.defaultRole)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [dangerousAction, setDangerousAction] = useState<DangerousAction>()
  const user = detail.data
  const isSelf = user?.id === actor?.user.id
  useEffect(() => {
    if (user?.role) setRole(user.role)
  }, [user?.role])

  const setRoleMutation = useMutation(
    setAdminUserRoleOptions(auth.authClient, actor?.user.id)
  )
  const ban = useMutation(banAdminUserOptions(auth.authClient, actor?.user.id))
  const unban = useMutation(
    unbanAdminUserOptions(auth.authClient, actor?.user.id)
  )
  const remove = useMutation(
    removeAdminUserOptions(auth.authClient, actor?.user.id)
  )
  const impersonate = useMutation(
    impersonateAdminUserOptions(auth.authClient, actor?.user.id)
  )
  const revokeSession = useMutation(
    revokeAdminUserSessionOptions(auth.authClient, actor?.user.id, userId)
  )
  const revokeSessions = useMutation(
    revokeAdminUserSessionsOptions(auth.authClient, actor?.user.id, userId)
  )

  const confirm = () => {
    if (!user) return
    if (dangerousAction === "ban")
      ban.mutate(
        { userId: user.id },
        { onSuccess: () => setDangerousAction(undefined) }
      )
    if (dangerousAction === "delete")
      remove.mutate(
        { userId: user.id },
        {
          onSuccess: () => {
            setDangerousAction(undefined)
            onOpenChange(false)
          }
        }
      )
    if (dangerousAction === "revokeAll")
      revokeSessions.mutate(
        { userId: user.id },
        { onSuccess: () => setDangerousAction(undefined) }
      )
    if (dangerousAction === "impersonate")
      impersonate.mutate(
        { userId: user.id },
        {
          onSuccess: () => {
            setDangerousAction(undefined)
            if (config.impersonationRedirectTo)
              auth.navigate({ to: config.impersonationRedirectTo })
          }
        }
      )
  }
  const closeDangerousAction = () => {
    ban.reset()
    remove.reset()
    revokeSessions.reset()
    impersonate.reset()
    setDangerousAction(undefined)
  }
  const dangerousMutation =
    dangerousAction === "ban"
      ? ban
      : dangerousAction === "delete"
        ? remove
        : dangerousAction === "revokeAll"
          ? revokeSessions
          : impersonate
  const dangerousError = getAdminErrorMessage(dangerousMutation.error)
  const dangerLabel =
    dangerousAction === "ban"
      ? config.localization.banUser
      : dangerousAction === "delete"
        ? config.localization.deleteUser
        : dangerousAction === "revokeAll"
          ? config.localization.revokeAllSessions
          : config.localization.impersonateUser

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{config.localization.userDetails}</SheetTitle>
            <SheetDescription>
              {user?.email ?? config.localization.usersDescription}
            </SheetDescription>
          </SheetHeader>
          {detail.isPending ? (
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : user ? (
            <Tabs className="px-4 pb-6" defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">
                  {config.localization.overview}
                </TabsTrigger>
                <TabsTrigger value="sessions">
                  {config.localization.sessions}
                </TabsTrigger>
              </TabsList>
              <TabsContent
                className="flex flex-col gap-6 pt-4"
                value="overview"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar className="size-12" user={user} />
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                  <dt className="text-muted-foreground">
                    {config.localization.userId}
                  </dt>
                  <dd className="flex min-w-0 items-center gap-1">
                    <code className="truncate text-xs">{user.id}</code>
                    <Button
                      aria-label={config.localization.copyUserId}
                      onClick={() => navigator.clipboard.writeText(user.id)}
                      size="icon-xs"
                      variant="ghost"
                    >
                      <CopyIcon />
                    </Button>
                  </dd>
                  <dt className="text-muted-foreground">
                    {config.localization.created}
                  </dt>
                  <dd>{formatDate(user.createdAt)}</dd>
                  <dt className="text-muted-foreground">
                    {config.localization.status}
                  </dt>
                  <dd>
                    <Badge variant={user.banned ? "destructive" : "secondary"}>
                      {user.banned
                        ? config.localization.banned
                        : config.localization.active}
                    </Badge>
                  </dd>
                </dl>
                <div className="flex items-end gap-2">
                  <Field className="flex-1">
                    <FieldLabel>{config.localization.role}</FieldLabel>
                    <Select
                      value={role}
                      onValueChange={(value) => value && setRole(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config.roles.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {setRoleMutation.error ? (
                      <FieldError>
                        {getAdminErrorMessage(setRoleMutation.error)}
                      </FieldError>
                    ) : null}
                  </Field>
                  <Button
                    disabled={
                      setRoleMutation.isPending ||
                      canSetRole.isPending ||
                      !canSetRole.data?.success ||
                      isSelf
                    }
                    onClick={() =>
                      setRoleMutation.mutate({
                        userId: user.id,
                        role: asAdminRole(role)
                      })
                    }
                    variant="outline"
                  >
                    {config.localization.saveRole}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={
                      canSetPassword.isPending || !canSetPassword.data?.success
                    }
                    onClick={() => setPasswordOpen(true)}
                    variant="outline"
                  >
                    <KeyRoundIcon />
                    {config.localization.setPassword}
                  </Button>
                  <Button
                    disabled={
                      canBan.isPending || !canBan.data?.success || isSelf
                    }
                    onClick={() =>
                      user.banned
                        ? unban.mutate({ userId: user.id })
                        : setDangerousAction("ban")
                    }
                    variant="outline"
                  >
                    <BanIcon />
                    {user.banned
                      ? config.localization.unbanUser
                      : config.localization.banUser}
                  </Button>
                  <Button
                    disabled={
                      canImpersonate.isPending ||
                      !canImpersonate.data?.success ||
                      isSelf
                    }
                    onClick={() => setDangerousAction("impersonate")}
                    variant="outline"
                  >
                    <LogInIcon />
                    {config.localization.impersonateUser}
                  </Button>
                  <Button
                    disabled={
                      canDelete.isPending || !canDelete.data?.success || isSelf
                    }
                    onClick={() => setDangerousAction("delete")}
                    variant="destructive"
                  >
                    <Trash2Icon />
                    {config.localization.deleteUser}
                  </Button>
                </div>
                {unban.error ? (
                  <FieldError>{getAdminErrorMessage(unban.error)}</FieldError>
                ) : null}
              </TabsContent>
              <TabsContent
                className="flex flex-col gap-3 pt-4"
                value="sessions"
              >
                {sessionsPermission.isPending || sessions.isPending ? (
                  skeletonRowIds
                    .slice(0, 3)
                    .map((id) => (
                      <Skeleton className="h-20 w-full" key={`session-${id}`} />
                    ))
                ) : !sessionsPermission.data?.success ? (
                  <p className="text-sm text-muted-foreground">
                    {config.localization.accessDeniedDescription}
                  </p>
                ) : sessions.data?.sessions.length ? (
                  <>
                    <Button
                      className="self-end"
                      disabled={
                        canRevoke.isPending ||
                        !canRevoke.data?.success ||
                        isSelf
                      }
                      onClick={() => setDangerousAction("revokeAll")}
                      variant="outline"
                    >
                      {config.localization.revokeAllSessions}
                    </Button>
                    {sessions.data.sessions.map((item) => (
                      <div
                        className="flex items-start justify-between gap-3 rounded-lg border p-3"
                        key={item.id}
                      >
                        <div className="min-w-0 text-sm">
                          <div className="truncate font-medium">
                            {item.userAgent || config.localization.sessions}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(item.createdAt)} ·{" "}
                            {formatDate(item.expiresAt)}
                          </div>
                          {config.showIpAddress && item.ipAddress ? (
                            <div className="mt-1 font-mono text-xs text-muted-foreground">
                              {item.ipAddress}
                            </div>
                          ) : null}
                        </div>
                        <Button
                          aria-label={config.localization.revoke}
                          disabled={
                            revokeSession.isPending ||
                            canRevoke.isPending ||
                            !canRevoke.data?.success ||
                            isSelf
                          }
                          onClick={() =>
                            revokeSession.mutate({ sessionToken: item.token })
                          }
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {config.localization.noSessions}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <AdminState
              icon={<ShieldAlertIcon />}
              title={config.localization.loadUsersError}
              description={config.localization.loadUsersErrorDescription}
            />
          )}
        </SheetContent>
      </Sheet>
      <PasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        userId={user?.id}
      />
      <AlertDialog
        open={Boolean(dangerousAction)}
        onOpenChange={(value) => !value && closeDangerousAction()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dangerLabel}</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-2">
              <span>{user?.email}</span>
              {dangerousError ? (
                <span className="text-destructive" role="alert">
                  {dangerousError}
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{config.localization.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSelf || dangerousMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                confirm()
              }}
              variant={dangerousAction === "delete" ? "destructive" : "default"}
            >
              {dangerLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function PasswordDialog({
  open,
  onOpenChange,
  userId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
}) {
  const auth = useAuth<AdminAuthClient>()
  const config = useAuthPlugin(adminPlugin)
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string>()
  const mutation = useMutation(
    setAdminUserPasswordOptions(auth.authClient, () => {
      setTimeout(() => mutation.reset(), 0)
    })
  )
  const close = () => {
    setPassword("")
    setErrorMessage(undefined)
    mutation.reset()
    onOpenChange(false)
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setErrorMessage(undefined)
    if (userId)
      mutation.mutate(
        { userId, newPassword: password },
        {
          onError: (error) => setErrorMessage(getAdminErrorMessage(error)),
          onSuccess: close
        }
      )
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (value ? onOpenChange(true) : close())}
    >
      <DialogContent>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{config.localization.setPassword}</DialogTitle>
            <DialogDescription>
              {config.localization.userDetails}
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(errorMessage)}>
            <FieldLabel htmlFor="admin-new-password">
              {config.localization.password}
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                aria-invalid={Boolean(errorMessage)}
                autoComplete="new-password"
                id="admin-new-password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </InputGroup>
            <FieldError>{errorMessage}</FieldError>
          </Field>
          <DialogFooter>
            <Button onClick={close} type="button" variant="outline">
              {config.localization.cancel}
            </Button>
            <Button disabled={!password || mutation.isPending} type="submit">
              {config.localization.setPassword}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
