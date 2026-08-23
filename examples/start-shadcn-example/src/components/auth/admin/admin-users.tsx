"use client"

import {
  type AdditionalFieldValue,
  parseAdditionalFieldValues
} from "@better-auth-ui/core"
import {
  type AdminAuthClient,
  type AdminListUsersParams,
  banAdminUserOptions,
  createAdminUserOptions,
  impersonateAdminUserOptions,
  isAdminTarget,
  removeAdminUserOptions,
  revokeAdminUserSessionOptions,
  revokeAdminUserSessionsOptions,
  setAdminUserPasswordOptions,
  setAdminUserRoleOptions,
  unbanAdminUserOptions,
  updateAdminUserOptions
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
  EllipsisIcon,
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
  useRef,
  useState
} from "react"
import { AdditionalField } from "@/components/auth/additional-field"
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
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
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
import { adminPlugin } from "@/lib/auth/admin-plugin"

type SearchField = "email" | "name"
type SearchOperator = "contains" | "ends_with" | "starts_with"
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
  const [searchOperator, setSearchOperator] =
    useState<SearchOperator>("contains")
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
      searchOperator,
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
      searchOperator,
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
  const canGet = useAdminPermission(auth.authClient, { user: ["get"] })

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

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[9rem_10rem_minmax(14rem,1fr)_10rem]">
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
          <Select
            value={searchOperator}
            onValueChange={(value) => {
              setSearchOperator(value as SearchOperator)
              setPage(0)
            }}
          >
            <SelectTrigger aria-label={localization.searchOperator}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contains">
                {localization.searchContains}
              </SelectItem>
              <SelectItem value="starts_with">
                {localization.startsWith}
              </SelectItem>
              <SelectItem value="ends_with">{localization.endsWith}</SelectItem>
            </SelectContent>
          </Select>
          <InputGroup>
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
              <SelectItem value="all">
                {localization.filterAllStatuses}
              </SelectItem>
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
                      className={
                        canGet.data?.success ? "cursor-pointer" : undefined
                      }
                      onClick={
                        canGet.data?.success
                          ? () => setSelectedUserId(user.id)
                          : undefined
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar className="size-8" user={user} />
                          <div className="min-w-0">
                            {canGet.data?.success ? (
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
                            ) : (
                              <span className="truncate">{user.name}</span>
                            )}
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
        canGetUser={canGet.data?.success === true}
        open={Boolean(selectedUserId) && canGet.data?.success === true}
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
  const [emailVerified, setEmailVerified] = useState(false)
  const [formError, setFormError] = useState<string>()
  const [roles, setRoles] = useState([config.defaultRole])
  const createUser = useMutation(
    createAdminUserOptions(auth.authClient, session?.user.id)
  )
  const canSetRole = useAdminPermission(auth.authClient, {
    user: ["set-role"]
  })

  const close = () => {
    setPassword("")
    setEmailVerified(false)
    setFormError(undefined)
    setRoles([config.defaultRole])
    createUser.reset()
    onOpenChange(false)
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
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
        data: { ...additionalFieldValues, emailVerified },
        email: String(data.get("email")),
        name: String(data.get("name")),
        password,
        ...(canSetRole.data?.success ? { role: asAdminRoles(roles) } : {})
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
            {canSetRole.isPending ? (
              <Skeleton className="h-16 w-full" />
            ) : canSetRole.data?.success ? (
              <FieldSet>
                <FieldLegend variant="label">
                  {config.localization.role}
                </FieldLegend>
                <FieldGroup data-slot="checkbox-group">
                  {config.roles.map((role) => (
                    <Field key={role} orientation="horizontal">
                      <Checkbox
                        checked={roles.includes(role)}
                        id={`admin-create-role-${role}`}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...roles, role]
                            : roles.filter((item) => item !== role)
                          if (next.length) setRoles(next)
                        }}
                      />
                      <FieldLabel htmlFor={`admin-create-role-${role}`}>
                        {role}
                      </FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
              </FieldSet>
            ) : null}
            <Field orientation="horizontal">
              <Switch
                checked={emailVerified}
                id="admin-create-email-verified"
                onCheckedChange={setEmailVerified}
              />
              <FieldContent>
                <FieldLabel htmlFor="admin-create-email-verified">
                  {config.localization.emailVerified}
                </FieldLabel>
              </FieldContent>
            </Field>
            {auth.additionalFields?.map((field) => (
              <AdditionalField
                field={field}
                isPending={createUser.isPending}
                key={field.name}
                name={field.name}
              />
            ))}
          </FieldGroup>
          <FieldError>
            {formError ?? getAdminErrorMessage(createUser.error)}
          </FieldError>
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
  canGetUser,
  open,
  onOpenChange,
  userId
}: {
  canGetUser: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
}) {
  const auth = useAuth<AdminAuthClient>()
  const config = useAuthPlugin(adminPlugin)
  const contributedTabs = auth.plugins.flatMap((plugin) =>
    (plugin.adminUserTabs ?? []).map((tab) => ({
      ...tab,
      value: `${plugin.id}:${tab.id}`
    }))
  )
  const detail = useAdminUser(auth.authClient, userId, {
    enabled: canGetUser
  })
  const user = detail.data
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
  const canUpdate = useAdminPermission(
    auth.authClient,
    { user: ["update"] },
    { enabled: Boolean(userId) }
  )
  const canSetEmail = useAdminPermission(
    auth.authClient,
    { user: ["set-email"] },
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
  const targetIsAdmin = user
    ? isAdminTarget(user, config.adminRoles, config.adminUserIds)
    : false
  const canImpersonateAdmins = useAdminPermission(
    auth.authClient,
    { user: ["impersonate-admins"] },
    { enabled: Boolean(userId && targetIsAdmin) }
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
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [emailVerified, setEmailVerified] = useState(false)
  const [roles, setRoles] = useState([config.defaultRole])
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState("")
  const banDurationSeconds = getBanDurationSeconds(banDuration)
  const [profileError, setProfileError] = useState<string>()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [dangerousAction, setDangerousAction] = useState<DangerousAction>()
  const profileUserId = useRef(user?.id)
  const isSelf = user?.id === actor?.user.id

  const updateUser = useMutation(
    updateAdminUserOptions(auth.authClient, actor?.user.id)
  )

  useEffect(() => {
    setName(user?.name ?? "")
    setEmail(user?.email ?? "")
    setEmailVerified(user?.emailVerified ?? false)
    setRoles(parseAdminRoles(user?.role, config.defaultRole))
  }, [
    config.defaultRole,
    user?.email,
    user?.emailVerified,
    user?.name,
    user?.role
  ])

  useEffect(() => {
    if (profileUserId.current === user?.id) return
    profileUserId.current = user?.id
    setProfileError(undefined)
  }, [user?.id])

  useEffect(() => {
    if (user?.id) updateUser.reset()
  }, [user?.id, updateUser.reset])

  useEffect(() => {
    if (!open) updateUser.reset()
  }, [open, updateUser.reset])

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
    if (dangerousAction === "ban") {
      if (banDurationSeconds === null) return
      ban.mutate(
        {
          banExpiresIn: banDurationSeconds,
          banReason: banReason.trim() || undefined,
          userId: user.id
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
    setBanDuration("")
    setBanReason("")
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

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return

    const mutations: Promise<unknown>[] = []
    if (canUpdate.data?.success) {
      const formData = new FormData(event.currentTarget)
      let additionalFieldValues: Record<string, AdditionalFieldValue | null>
      try {
        additionalFieldValues = await parseAdditionalFieldValues(
          auth.additionalFields ?? [],
          formData
        )
      } catch (error) {
        setProfileError(error instanceof Error ? error.message : String(error))
        return
      }
      setProfileError(undefined)
      mutations.push(
        updateUser.mutateAsync({
          userId: user.id,
          data: {
            ...additionalFieldValues,
            name: name.trim(),
            ...(canSetEmail.data?.success
              ? { email: email.trim(), emailVerified }
              : {})
          }
        })
      )
    }
    if (canSetRole.data?.success && !isSelf) {
      mutations.push(
        setRoleMutation.mutateAsync({
          userId: user.id,
          role: asAdminRoles(roles)
        })
      )
    }

    try {
      await Promise.all(mutations)
    } catch {
      // Mutation errors are rendered next to the form.
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="h-[min(52rem,calc(100vh-2rem))] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-4xl">
          <DialogHeader className="border-b px-6 py-5 pr-14">
            {user ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar className="size-12" user={user} />
                  <div className="min-w-0">
                    <DialogTitle className="truncate">{user.name}</DialogTitle>
                    <DialogDescription className="truncate">
                      {user.email}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={user.banned ? "destructive" : "secondary"}>
                    {user.banned
                      ? config.localization.banned
                      : config.localization.active}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={config.localization.moreActions}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <EllipsisIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          disabled={
                            canImpersonate.isPending ||
                            !canImpersonate.data?.success ||
                            (targetIsAdmin &&
                              (canImpersonateAdmins.isPending ||
                                !canImpersonateAdmins.data?.success)) ||
                            isSelf
                          }
                          onSelect={() => setDangerousAction("impersonate")}
                        >
                          <LogInIcon />
                          {config.localization.impersonateUser}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <>
                <DialogTitle>{config.localization.userDetails}</DialogTitle>
                <DialogDescription>
                  {config.localization.usersDescription}
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          {detail.isPending ? (
            <div className="flex flex-col gap-3 p-6">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : user ? (
            <Tabs
              className="min-h-0 gap-0 overflow-hidden"
              defaultValue="overview"
            >
              <TabsList className="mx-6 h-11 shrink-0" variant="line">
                <TabsTrigger value="overview">
                  {config.localization.overview}
                </TabsTrigger>
                <TabsTrigger
                  disabled={
                    sessionsPermission.isPending ||
                    !sessionsPermission.data?.success
                  }
                  value="sessions"
                >
                  {config.localization.sessions}
                </TabsTrigger>
                {contributedTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent className="min-h-0 overflow-hidden" value="overview">
                <form
                  className="grid h-full grid-rows-[minmax(0,1fr)_auto]"
                  onSubmit={saveUser}
                >
                  <div className="overflow-y-auto">
                    <section className="flex flex-col gap-5 p-6">
                      <h3 className="font-medium">
                        {config.localization.profileAndAccess}
                      </h3>
                      <FieldGroup className="grid gap-5 md:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="admin-user-name">
                            {config.localization.name}
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              disabled={!canUpdate.data?.success}
                              id="admin-user-name"
                              value={name}
                              onChange={(event) => setName(event.target.value)}
                            />
                          </InputGroup>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="admin-user-email">
                            {config.localization.email}
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              disabled={
                                !canUpdate.data?.success ||
                                !canSetEmail.data?.success
                              }
                              id="admin-user-email"
                              onChange={(event) => setEmail(event.target.value)}
                              required
                              type="email"
                              value={email}
                            />
                          </InputGroup>
                        </Field>
                        <Field orientation="horizontal">
                          <Switch
                            checked={emailVerified}
                            disabled={
                              !canUpdate.data?.success ||
                              !canSetEmail.data?.success
                            }
                            id="admin-user-email-verified"
                            onCheckedChange={setEmailVerified}
                          />
                          <FieldContent>
                            <FieldLabel htmlFor="admin-user-email-verified">
                              {config.localization.emailVerified}
                            </FieldLabel>
                          </FieldContent>
                        </Field>
                        <FieldSet>
                          <FieldLegend variant="label">
                            {config.localization.role}
                          </FieldLegend>
                          <FieldGroup
                            className="flex-row flex-wrap gap-4"
                            data-slot="checkbox-group"
                          >
                            {config.roles.map((item) => (
                              <Field key={item} orientation="horizontal">
                                <Checkbox
                                  checked={roles.includes(item)}
                                  disabled={isSelf || !canSetRole.data?.success}
                                  id={`admin-user-role-${item}`}
                                  onCheckedChange={(checked) => {
                                    const next = checked
                                      ? [...roles, item]
                                      : roles.filter((role) => role !== item)
                                    if (next.length) setRoles(next)
                                  }}
                                />
                                <FieldLabel htmlFor={`admin-user-role-${item}`}>
                                  {item}
                                </FieldLabel>
                              </Field>
                            ))}
                          </FieldGroup>
                        </FieldSet>
                        {auth.additionalFields?.map((field) => {
                          const value = (
                            user as unknown as Record<string, unknown>
                          )[field.name]
                          return (
                            <AdditionalField
                              field={{
                                ...field,
                                defaultValue:
                                  value as AdditionalFieldValue | null
                              }}
                              isPending={
                                updateUser.isPending || !canUpdate.data?.success
                              }
                              key={`${user.id}-${field.name}-${String(value ?? "")}`}
                              name={field.name}
                            />
                          )
                        })}
                      </FieldGroup>
                      <FieldError>
                        {profileError ??
                          getAdminErrorMessage(updateUser.error) ??
                          getAdminErrorMessage(setRoleMutation.error)}
                      </FieldError>
                    </section>
                    <Separator />
                    <section className="flex flex-col gap-4 p-6">
                      <h3 className="font-medium">
                        {config.localization.accountInformation}
                      </h3>
                      <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <dt className="text-muted-foreground">
                            {config.localization.userId}
                          </dt>
                          <dd className="flex min-w-0 items-center gap-1">
                            <code className="truncate text-xs">{user.id}</code>
                            <Button
                              aria-label={config.localization.copyUserId}
                              onClick={() =>
                                navigator.clipboard.writeText(user.id)
                              }
                              size="icon-xs"
                              type="button"
                              variant="ghost"
                            >
                              <CopyIcon />
                            </Button>
                          </dd>
                        </div>
                        <div className="flex flex-col gap-1">
                          <dt className="text-muted-foreground">
                            {config.localization.created}
                          </dt>
                          <dd>{formatDate(user.createdAt)}</dd>
                        </div>
                        <div className="flex flex-col gap-1">
                          <dt className="text-muted-foreground">
                            {config.localization.status}
                          </dt>
                          <dd>
                            <Badge
                              variant={
                                user.banned ? "destructive" : "secondary"
                              }
                            >
                              {user.banned
                                ? config.localization.banned
                                : config.localization.active}
                            </Badge>
                          </dd>
                        </div>
                        {user.banned && user.banReason ? (
                          <div className="flex flex-col gap-1">
                            <dt className="text-muted-foreground">
                              {config.localization.banReason}
                            </dt>
                            <dd>{user.banReason}</dd>
                          </div>
                        ) : null}
                        {user.banned && user.banExpires ? (
                          <div className="flex flex-col gap-1">
                            <dt className="text-muted-foreground">
                              {config.localization.banExpires}
                            </dt>
                            <dd>{formatDate(user.banExpires)}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </section>
                    <Separator />
                    <section className="flex flex-col gap-4 p-6">
                      <h3 className="font-medium">
                        {config.localization.security}
                      </h3>
                      <div>
                        <Button
                          disabled={
                            canSetPassword.isPending ||
                            !canSetPassword.data?.success
                          }
                          onClick={() => setPasswordOpen(true)}
                          type="button"
                          variant="outline"
                        >
                          <KeyRoundIcon />
                          {config.localization.setPassword}
                        </Button>
                      </div>
                    </section>
                    <Separator />
                    <section className="flex flex-col gap-4 p-6">
                      <h3 className="font-medium">
                        {config.localization.dangerZone}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          disabled={
                            canBan.isPending || !canBan.data?.success || isSelf
                          }
                          onClick={() =>
                            user.banned
                              ? unban.mutate({ userId: user.id })
                              : setDangerousAction("ban")
                          }
                          type="button"
                          variant="outline"
                        >
                          <BanIcon />
                          {user.banned
                            ? config.localization.unbanUser
                            : config.localization.banUser}
                        </Button>
                        <Button
                          disabled={
                            canDelete.isPending ||
                            !canDelete.data?.success ||
                            isSelf
                          }
                          onClick={() => setDangerousAction("delete")}
                          type="button"
                          variant="destructive"
                        >
                          <Trash2Icon />
                          {config.localization.deleteUser}
                        </Button>
                      </div>
                      {unban.error ? (
                        <FieldError>
                          {getAdminErrorMessage(unban.error)}
                        </FieldError>
                      ) : null}
                    </section>
                  </div>
                  <div className="flex flex-col-reverse gap-2 border-t bg-muted/50 px-6 py-4 sm:flex-row sm:justify-end">
                    <Button
                      onClick={() => onOpenChange(false)}
                      type="button"
                      variant="outline"
                    >
                      {config.localization.cancel}
                    </Button>
                    <Button
                      disabled={
                        !name.trim() ||
                        !email.trim() ||
                        updateUser.isPending ||
                        setRoleMutation.isPending ||
                        canUpdate.isPending ||
                        canSetRole.isPending ||
                        (!canUpdate.data?.success &&
                          (!canSetRole.data?.success || isSelf))
                      }
                      type="submit"
                    >
                      {config.localization.saveChanges}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent
                className="min-h-0 overflow-y-auto p-6"
                value="sessions"
              >
                <div className="flex flex-col gap-3">
                  {sessionsPermission.isPending || sessions.isPending ? (
                    skeletonRowIds
                      .slice(0, 3)
                      .map((id) => (
                        <Skeleton
                          className="h-20 w-full"
                          key={`session-${id}`}
                        />
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
                </div>
              </TabsContent>
              {contributedTabs.map((tab) => {
                const ContributedTab = tab.component
                return (
                  <TabsContent
                    className="min-h-0 overflow-y-auto p-6"
                    key={tab.value}
                    value={tab.value}
                  >
                    <ContributedTab userId={user.id} />
                  </TabsContent>
                )
              })}
            </Tabs>
          ) : (
            <AdminState
              icon={<ShieldAlertIcon />}
              title={config.localization.loadUsersError}
              description={config.localization.loadUsersErrorDescription}
            />
          )}
        </DialogContent>
      </Dialog>
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
            <AlertDialogDescription>{user?.email}</AlertDialogDescription>
          </AlertDialogHeader>
          {dangerousAction === "ban" ? (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="admin-ban-reason">
                  {config.localization.banReason}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="admin-ban-reason"
                    onChange={(event) => setBanReason(event.target.value)}
                    value={banReason}
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="admin-ban-duration">
                  {config.localization.banDuration}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="admin-ban-duration"
                    min="1"
                    onChange={(event) => setBanDuration(event.target.value)}
                    step="1"
                    type="number"
                    value={banDuration}
                  />
                </InputGroup>
                <p className="text-xs text-muted-foreground">
                  {config.localization.banDurationDescription}
                </p>
              </Field>
            </FieldGroup>
          ) : null}
          {dangerousError ? <FieldError>{dangerousError}</FieldError> : null}
          <AlertDialogFooter>
            <AlertDialogCancel>{config.localization.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                isSelf ||
                dangerousMutation.isPending ||
                (dangerousAction === "ban" && banDurationSeconds === null)
              }
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
