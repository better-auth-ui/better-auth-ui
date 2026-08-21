"use client"

import type {
  AdminAuthClient,
  AdminListUsersParams
} from "@better-auth-ui/core/plugins/admin"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useAdminPermission,
  useAdminUser,
  useAdminUserSessions,
  useAdminUsers
} from "@better-auth-ui/react/plugins/admin"
import {
  Button,
  Chip,
  cn,
  Drawer,
  Label,
  ListBox,
  SearchField,
  Select,
  Skeleton,
  Table,
  Tabs
} from "@heroui/react"
import { keepPreviousData } from "@tanstack/react-query"
import { useDeferredValue, useMemo, useState } from "react"

import { adminPlugin } from "../../../lib/auth/admin-plugin"
import { UserAvatar } from "../user/user-avatar"

type SearchFieldName = "email" | "name"

export type AdminUsersProps = {
  className?: string
  onSelectedUserIdChange?: (userId: string | undefined) => void
  selectedUserId?: string
}

const rowSkeletonIds = ["hero-admin-1", "hero-admin-2", "hero-admin-3"]

const formatDate = (value: Date | string | undefined | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "–"

/** HeroUI presentation for the static Admin users view. */
export function AdminUsers({
  className,
  onSelectedUserIdChange,
  selectedUserId: controlledSelectedUserId
}: AdminUsersProps) {
  const { authClient } = useAuth<AdminAuthClient>()
  const config = useAuthPlugin(adminPlugin)
  const [localSelectedUserId, setLocalSelectedUserId] = useState<string>()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [searchField, setSearchField] = useState<SearchFieldName>("email")
  const deferredSearch = useDeferredValue(search.trim())
  const isSelectionControlled = onSelectedUserIdChange !== undefined
  const selectedUserId = isSelectionControlled
    ? controlledSelectedUserId
    : localSelectedUserId
  const permission = useAdminPermission(authClient, { user: ["list"] })
  const params = useMemo<AdminListUsersParams>(
    () => ({
      limit: config.pageSize,
      offset: page * config.pageSize,
      searchField,
      searchOperator: "contains",
      searchValue: deferredSearch || undefined,
      sortBy: "createdAt",
      sortDirection: "desc"
    }),
    [config.pageSize, deferredSearch, page, searchField]
  )
  const users = useAdminUsers(authClient, {
    enabled: permission.data?.success === true,
    params,
    placeholderData: keepPreviousData
  })

  const selectUser = (userId: string | undefined) => {
    if (!isSelectionControlled) setLocalSelectedUserId(userId)
    onSelectedUserIdChange?.(userId)
  }
  const total = users.data?.total ?? 0

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{config.localization.users}</h1>
        <p className="text-sm text-muted">
          {config.localization.usersDescription}
        </p>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Select
          className="sm:w-36"
          value={searchField}
          onChange={(value) => {
            setSearchField(String(value) as SearchFieldName)
            setPage(0)
          }}
        >
          <Label>{config.localization.search}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="email">
                {config.localization.email}
              </ListBox.Item>
              <ListBox.Item id="name">{config.localization.name}</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
        <SearchField
          className="w-full sm:max-w-md"
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(0)
          }}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              placeholder={
                searchField === "email"
                  ? config.localization.searchByEmail
                  : config.localization.searchByName
              }
            />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </div>

      {permission.isPending ? (
        <AdminTableSkeleton />
      ) : !permission.data?.success ? (
        <AdminMessage
          description={config.localization.accessDeniedDescription}
          title={config.localization.accessDenied}
        />
      ) : users.isError ? (
        <AdminMessage
          description={config.localization.loadUsersErrorDescription}
          title={config.localization.loadUsersError}
        />
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={config.localization.users}>
              <Table.Header>
                <Table.Column isRowHeader>
                  {config.localization.name}
                </Table.Column>
                <Table.Column>{config.localization.role}</Table.Column>
                <Table.Column>{config.localization.status}</Table.Column>
                <Table.Column>{config.localization.created}</Table.Column>
              </Table.Header>
              <Table.Body>
                {users.isPending
                  ? rowSkeletonIds.map((id) => (
                      <Table.Row id={id} key={id}>
                        <Table.Cell>
                          <Skeleton className="h-8 w-52" />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className="h-5 w-16" />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className="h-5 w-16" />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className="h-4 w-24" />
                        </Table.Cell>
                      </Table.Row>
                    ))
                  : users.data?.users.map((user) => (
                      <Table.Row id={user.id} key={user.id}>
                        <Table.Cell>
                          <Button
                            className="h-auto justify-start px-0"
                            variant="tertiary"
                            onPress={() => selectUser(user.id)}
                          >
                            <UserAvatar user={user} />
                            <span className="min-w-0 text-start">
                              <span className="block truncate font-medium">
                                {user.name}
                              </span>
                              <span className="block truncate text-xs text-muted">
                                {user.email}
                              </span>
                            </span>
                          </Button>
                        </Table.Cell>
                        <Table.Cell>
                          <Chip size="sm">
                            {user.role ?? config.defaultRole}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>
                          <Chip
                            color={user.banned ? "danger" : "default"}
                            size="sm"
                          >
                            {user.banned
                              ? config.localization.banned
                              : config.localization.active}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>{formatDate(user.createdAt)}</Table.Cell>
                      </Table.Row>
                    ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}

      <footer className="flex items-center justify-between gap-2 text-sm text-muted">
        <span>
          {config.localization.usersPaginationRange
            .replace("{{from}}", String(total ? page * config.pageSize + 1 : 0))
            .replace(
              "{{to}}",
              String(Math.min(total, (page + 1) * config.pageSize))
            )
            .replace("{{total}}", String(total))}
        </span>
        <div className="flex gap-2">
          <Button
            isDisabled={page === 0}
            size="sm"
            variant="outline"
            onPress={() => setPage((value) => Math.max(0, value - 1))}
          >
            {config.localization.previousPage}
          </Button>
          <Button
            isDisabled={(page + 1) * config.pageSize >= total}
            size="sm"
            variant="outline"
            onPress={() => setPage((value) => value + 1)}
          >
            {config.localization.nextPage}
          </Button>
        </div>
      </footer>

      <UserDrawer
        isOpen={Boolean(selectedUserId)}
        onOpenChange={(open) => !open && selectUser(undefined)}
        userId={selectedUserId}
      />
    </section>
  )
}

function AdminMessage({
  description,
  title
}: {
  description: string
  title: string
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-8 text-center">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-muted">{description}</p>
    </div>
  )
}

function AdminTableSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border p-4">
      {rowSkeletonIds.map((id) => (
        <Skeleton className="h-12 w-full" key={id} />
      ))}
    </div>
  )
}

function UserDrawer({
  isOpen,
  onOpenChange,
  userId
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
}) {
  const { authClient, plugins } = useAuth<AdminAuthClient>()
  const config = useAuthPlugin(adminPlugin)
  const contributedTabs = useMemo(
    () =>
      plugins.flatMap((plugin) =>
        (plugin.adminUserTabs ?? []).map((tab) => ({
          ...tab,
          id: `${plugin.id}:${tab.id}`
        }))
      ),
    [plugins]
  )
  const user = useAdminUser(authClient, userId)
  const sessionsPermission = useAdminPermission(authClient, {
    session: ["list"]
  })
  const sessions = useAdminUserSessions(authClient, userId, {
    enabled: sessionsPermission.data?.success === true
  })

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement="right">
        <Drawer.Dialog>
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>{config.localization.userDetails}</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            {user.isPending ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="size-12 rounded-full" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : user.data ? (
              <Tabs>
                <Tabs.ListContainer>
                  <Tabs.List aria-label={config.localization.userDetails}>
                    <Tabs.Tab id="overview">
                      {config.localization.overview}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="sessions">
                      {config.localization.sessions}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    {contributedTabs.map((tab) => (
                      <Tabs.Tab id={tab.id} key={tab.id}>
                        {tab.label}
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                </Tabs.ListContainer>
                <Tabs.Panel className="flex flex-col gap-4 pt-4" id="overview">
                  <div className="flex items-center gap-3">
                    <UserAvatar size="lg" user={user.data} />
                    <div>
                      <div className="font-medium">{user.data.name}</div>
                      <div className="text-sm text-muted">
                        {user.data.email}
                      </div>
                    </div>
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-3 text-sm">
                    <dt className="text-muted">{config.localization.userId}</dt>
                    <dd className="font-mono text-xs">{user.data.id}</dd>
                    <dt className="text-muted">{config.localization.role}</dt>
                    <dd>{user.data.role ?? config.defaultRole}</dd>
                    <dt className="text-muted">
                      {config.localization.created}
                    </dt>
                    <dd>{formatDate(user.data.createdAt)}</dd>
                  </dl>
                </Tabs.Panel>
                <Tabs.Panel className="flex flex-col gap-2 pt-4" id="sessions">
                  {sessions.isPending ? (
                    rowSkeletonIds.map((id) => (
                      <Skeleton className="h-16 w-full" key={`drawer-${id}`} />
                    ))
                  ) : sessions.data?.sessions.length ? (
                    sessions.data.sessions.map((session) => (
                      <div className="rounded-xl border p-3" key={session.id}>
                        <div className="truncate text-sm font-medium">
                          {session.userAgent || config.localization.sessions}
                        </div>
                        <div className="text-xs text-muted">
                          {formatDate(session.createdAt)} ·{" "}
                          {formatDate(session.expiresAt)}
                        </div>
                        {config.showIpAddress && session.ipAddress ? (
                          <div className="mt-1 font-mono text-xs text-muted">
                            {session.ipAddress}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="py-8 text-center text-sm text-muted">
                      {config.localization.noSessions}
                    </p>
                  )}
                </Tabs.Panel>
                {contributedTabs.map((tab) => {
                  const ContributedTab = tab.component
                  return (
                    <Tabs.Panel className="pt-4" id={tab.id} key={tab.id}>
                      <ContributedTab userId={user.data.id} />
                    </Tabs.Panel>
                  )
                })}
              </Tabs>
            ) : (
              <AdminMessage
                title={config.localization.loadUsersError}
                description={config.localization.loadUsersErrorDescription}
              />
            )}
          </Drawer.Body>
          <Drawer.Footer>
            <Button slot="close" variant="secondary">
              {config.localization.close}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
