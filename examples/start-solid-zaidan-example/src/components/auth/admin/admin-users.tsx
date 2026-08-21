import {
  type AdminAuthClient,
  type AdminListUsersParams,
  adminPlugin
} from "@better-auth-ui/core/plugins/admin"
import { useAuth } from "@better-auth-ui/solid"
import {
  useAdminPermission,
  useAdminUser,
  useAdminUserSessions,
  useAdminUsers
} from "@better-auth-ui/solid/plugins/admin"
import { createDebounce } from "@solid-primitives/debounce"
import { Search } from "lucide-solid"
import { createMemo, createSignal, For, Show } from "solid-js"
import { Dynamic } from "solid-js/web"

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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
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
import { cn } from "@/lib/utils"

import { UserAvatar } from "../user/user-avatar"

export type AdminUsersProps = {
  class?: string
  onSelectedUserIdChange?: (userId: string | undefined) => void
  selectedUserId?: string
}

const skeletonIds = ["solid-admin-1", "solid-admin-2", "solid-admin-3"]

const formatDate = (value: Date | string | undefined | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "–"

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
  const updateDebouncedSearch = createDebounce(setDebouncedSearch, 300)
  const selectedUserId = () =>
    props.onSelectedUserIdChange ? props.selectedUserId : localSelectedUserId()
  const permission = useAdminPermission(authClient, () => ({ user: ["list"] }))
  const params = createMemo<AdminListUsersParams>(() => ({
    limit: config().pageSize,
    offset: page() * config().pageSize,
    searchField: searchField(),
    searchOperator: "contains",
    searchValue: debouncedSearch() || undefined,
    sortBy: "createdAt",
    sortDirection: "desc"
  }))
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
      <header class="flex flex-col gap-1">
        <h1 class="text-xl font-semibold">{config().localization.users}</h1>
        <p class="text-sm text-muted-foreground">
          {config().localization.usersDescription}
        </p>
      </header>

      <div class="flex flex-col gap-2 sm:flex-row">
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
        <InputGroup class="sm:max-w-md">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={config().localization.search}
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
                            class="cursor-pointer"
                            onClick={() => selectUser(user.id)}
                          >
                            <TableCell>
                              <div class="flex items-center gap-3">
                                <UserAvatar user={user} />
                                <div class="min-w-0">
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
        open={Boolean(selectedUserId())}
        onOpenChange={(open) => !open && selectUser(undefined)}
        userId={selectedUserId}
      />
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

function UserDialog(props: {
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
  const user = useAdminUser(authClient, props.userId)
  const sessionsPermission = useAdminPermission(authClient, () => ({
    session: ["list"]
  }))
  const sessions = useAdminUserSessions(authClient, props.userId, () => ({
    enabled: sessionsPermission.data?.success === true
  }))

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent class="max-h-[90vh] max-w-lg overflow-y-auto rounded-xl border bg-popover p-4">
        <DialogHeader>
          <DialogTitle>{config().localization.userDetails}</DialogTitle>
          <DialogDescription>
            {user.data?.email ?? config().localization.usersDescription}
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
            when={user.data}
          >
            {(detail) => (
              <Tabs class="mt-4" defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">
                    {config().localization.overview}
                  </TabsTrigger>
                  <TabsTrigger value="sessions">
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
                <TabsContent class="flex flex-col gap-4 pt-4" value="overview">
                  <div class="flex items-center gap-3">
                    <UserAvatar class="size-12" user={detail()} />
                    <div>
                      <div class="font-medium">{detail().name}</div>
                      <div class="text-sm text-muted-foreground">
                        {detail().email}
                      </div>
                    </div>
                  </div>
                  <dl class="grid grid-cols-[auto_1fr] gap-3 text-sm">
                    <dt class="text-muted-foreground">
                      {config().localization.userId}
                    </dt>
                    <dd class="font-mono text-xs">{detail().id}</dd>
                    <dt class="text-muted-foreground">
                      {config().localization.role}
                    </dt>
                    <dd>{detail().role ?? config().defaultRole}</dd>
                    <dt class="text-muted-foreground">
                      {config().localization.created}
                    </dt>
                    <dd>{formatDate(detail().createdAt)}</dd>
                  </dl>
                </TabsContent>
                <TabsContent class="flex flex-col gap-2 pt-4" value="sessions">
                  <Show
                    fallback={<SessionRowsSkeleton />}
                    when={!sessionsPermission.isPending}
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
                        fallback={<SessionRowsSkeleton />}
                        when={!sessions.isPending}
                      >
                        <Show
                          fallback={
                            <p class="py-8 text-center text-sm text-muted-foreground">
                              {config().localization.noSessions}
                            </p>
                          }
                          when={sessions.data?.sessions.length}
                        >
                          <For each={sessions.data?.sessions}>
                            {(session) => (
                              <div class="rounded-lg border p-3">
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
                                    config().showIpAddress && session.ipAddress
                                  }
                                >
                                  <div class="mt-1 font-mono text-xs text-muted-foreground">
                                    {session.ipAddress}
                                  </div>
                                </Show>
                              </div>
                            )}
                          </For>
                        </Show>
                      </Show>
                    </Show>
                  </Show>
                </TabsContent>
                <For each={contributedTabs()}>
                  {(tab) => (
                    <TabsContent class="pt-4" value={tab.value}>
                      <Dynamic component={tab.component} userId={detail().id} />
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
  )
}
