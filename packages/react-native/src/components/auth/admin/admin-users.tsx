import {
  validateEmailAddress,
  validateStringLength
} from "@better-auth-ui/core"
import {
  adminPermissionOptions,
  isAdminTarget,
  type AdminAuthClient,
  type AdminUser
} from "@better-auth-ui/core/plugins/admin"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useAdminUsers,
  useAdminUser,
  useAdminUserSessions,
  useCreateAdminUser,
  useUpdateAdminUser,
  useSetAdminUserRole,
  useSetAdminUserPassword,
  useBanAdminUser,
  useUnbanAdminUser,
  useRemoveAdminUser,
  useImpersonateAdminUser,
  useRevokeAdminUserSession,
  useRevokeAdminUserSessions
} from "@better-auth-ui/react/plugins/admin"
import { useQueries, keepPreviousData } from "@tanstack/react-query"
import { useState } from "react"
import { adminPlugin } from "../../../lib/auth/admin-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { useNativeLocale } from "../../../lib/native-locale"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Checkbox } from "../../../primitives/checkbox"
import { CopyValue } from "../copy-value"
import { Description } from "../../../primitives/description"
import { SearchField } from "../../../primitives/inputs-extra"
import { Select } from "../../../primitives/menu"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { Tabs } from "../../../primitives/tabs"
import { useAuthForm } from "../auth-form"

const actions = {
  list: { user: ["list"] },
  create: { user: ["create"] },
  update: { user: ["update"] },
  role: { user: ["set-role"] },
  password: { user: ["set-password"] },
  ban: { user: ["ban"] },
  remove: { user: ["delete"] },
  impersonate: { user: ["impersonate"] },
  impersonateAdmin: { user: ["impersonate-admins"] },
  sessions: { session: ["list"] },
  revoke: { session: ["revoke"] }
} as const
function useAdminActions() {
  const { authClient } = useAuth()
  const { data } = useSession(authClient)
  const names = Object.keys(actions) as (keyof typeof actions)[]
  const queries = useQueries({
    queries: names.map((name) =>
      adminPermissionOptions(
        authClient as AdminAuthClient,
        data?.user.id,
        actions[name]
      )
    )
  })
  return {
    permissionPending: queries.some((query) => query.isPending),
    ...Object.fromEntries(
      names.map((name, position) => [
        name,
        queries[position]!.data?.success === true
      ])
    )
  } as Record<keyof typeof actions, boolean> & { permissionPending: boolean }
}

type Action =
  | { type: "create" }
  | {
      type:
        | "edit"
        | "role"
        | "password"
        | "ban"
        | "unban"
        | "remove"
        | "impersonate"
      user: AdminUser
    }
export function AdminUsers(props: CardSlotProps) {
  const { authClient, localization: common } = useAuth()
  const { localization, pageSize } = useAuthPlugin(adminPlugin)
  const allowed = useAdminActions()
  const [search, setSearch] = useState("")
  const [searchField, setSearchField] = useState<"email" | "name">("email")
  const [operator, setOperator] = useState<
    "contains" | "starts_with" | "ends_with"
  >("contains")
  const [sort, setSort] = useState("newest")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(0)
  const [action, setAction] = useState<Action>()
  const [selected, setSelected] = useState<string>()
  const { languageTag } = useNativeLocale()
  const offset = page * pageSize
  const users = useAdminUsers(authClient as AdminAuthClient, {
    enabled: allowed.list,
    placeholderData: keepPreviousData,
    params: {
      limit: pageSize,
      offset,
      searchValue: search.trim() || undefined,
      searchField,
      searchOperator: operator,
      sortBy: sort.startsWith("name") ? "name" : "createdAt",
      sortDirection: sort === "oldest" || sort === "name-asc" ? "asc" : "desc",
      ...(status !== "all" && {
        filterField: "banned",
        filterValue: status === "banned",
        filterOperator: "eq" as const
      })
    }
  })
  const number = new Intl.NumberFormat(languageTag)
  return (
    <Box className={props.className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.users}</Txt>
      <Description>{localization.usersDescription}</Description>
      <SearchField
        value={search}
        onChangeText={(value) => {
          setSearch(value)
          setPage(0)
        }}
        placeholder={localization.search}
        aria-label={localization.search}
      />
      <Select
        label={localization.search}
        selectedKey={searchField}
        options={[
          { key: "email", label: localization.searchByEmail },
          { key: "name", label: localization.searchByName }
        ]}
        onSelectionChange={(key) => {
          setSearchField(key as typeof searchField)
          setPage(0)
        }}
      />
      <Select
        label={localization.searchOperator}
        selectedKey={operator}
        options={[
          { key: "contains", label: localization.searchContains },
          { key: "starts_with", label: localization.startsWith },
          { key: "ends_with", label: localization.endsWith }
        ]}
        onSelectionChange={(key) => {
          setOperator(key as typeof operator)
          setPage(0)
        }}
      />
      <Select
        label={localization.sort}
        selectedKey={sort}
        options={[
          { key: "newest", label: localization.sortNewest },
          { key: "oldest", label: localization.sortOldest },
          { key: "name-asc", label: localization.sortNameAscending },
          { key: "name-desc", label: localization.sortNameDescending }
        ]}
        onSelectionChange={(key) => {
          setSort(key)
          setPage(0)
        }}
      />
      <Select
        label={localization.status}
        selectedKey={status}
        options={[
          { key: "all", label: localization.filterAllStatuses },
          { key: "active", label: localization.active },
          { key: "banned", label: localization.banned }
        ]}
        onSelectionChange={(key) => {
          setStatus(key)
          setPage(0)
        }}
      />
      {!allowed.permissionPending && !allowed.list ? (
        <Description>{common.errors.permissionDenied}</Description>
      ) : null}
      {allowed.create ? (
        <Button onPress={() => setAction({ type: "create" })}>
          {localization.createUser}
        </Button>
      ) : null}
      {allowed.permissionPending || (allowed.list && users.isPending) ? (
        <Skeleton className="h-20 w-full" />
      ) : null}
      {users.error ? (
        <>
          <Txt accessibilityRole="alert">{localization.loadUsersError}</Txt>
          <Button
            onPress={() => {
              void users.refetch()
            }}
          >
            {localization.retry}
          </Button>
        </>
      ) : null}
      {users.data?.users.length === 0 ? (
        <Description>{localization.noUsersDescription}</Description>
      ) : null}
      {users.data?.users.map((user) => (
        <Card key={user.id} variant={props.variant}>
          <Card.Content className="gap-2">
            <Txt className="font-medium">{user.name}</Txt>
            <Description>{user.email}</Description>
            <Description>{user.role}</Description>
            <Description>
              {user.banned ? localization.banned : localization.active}
            </Description>
            <Button onPress={() => setSelected(user.id)}>
              {localization.userDetails}
            </Button>
          </Card.Content>
        </Card>
      ))}
      {users.data ? (
        <Description>
          {localization.usersPaginationRange
            .replace(
              "{{from}}",
              number.format(users.data.total ? offset + 1 : 0)
            )
            .replace(
              "{{to}}",
              number.format(Math.min(offset + pageSize, users.data.total))
            )
            .replace("{{total}}", number.format(users.data.total))}
        </Description>
      ) : null}
      <Box className="flex-row gap-2">
        <Button
          isDisabled={users.isFetching || !page}
          onPress={() => setPage(page - 1)}
        >
          {localization.previousPage}
        </Button>
        <Button
          isDisabled={
            users.isFetching ||
            !users.data ||
            offset + pageSize >= users.data.total
          }
          onPress={() => setPage(page + 1)}
        >
          {localization.nextPage}
        </Button>
      </Box>
      {selected ? (
        <AdminUserInspector
          key={selected}
          userId={selected}
          onClose={() => setSelected(undefined)}
          onAction={setAction}
          variant={props.variant}
        />
      ) : null}
      {action ? (
        <AdminAction
          key={
            action.type === "create"
              ? "create"
              : `${action.user.id}:${action.type}`
          }
          action={action}
          onClose={() => setAction(undefined)}
        />
      ) : null}
    </Box>
  )
}

function AdminUserInspector({
  userId,
  onClose,
  onAction,
  variant
}: CardSlotProps & {
  userId: string
  onClose: () => void
  onAction: (action: Action) => void
}) {
  const { authClient, plugins } = useAuth()
  const { localization, adminRoles, adminUserIds, showIpAddress } =
    useAuthPlugin(adminPlugin)
  const allowed = useAdminActions()
  const user = useAdminUser(authClient as AdminAuthClient, userId, {
    enabled: allowed.list
  })
  const sessions = useAdminUserSessions(authClient as AdminAuthClient, userId, {
    enabled: allowed.sessions
  })
  const revoke = useRevokeAdminUserSession(
    authClient as AdminAuthClient,
    userId
  )
  const revokeAll = useRevokeAdminUserSessions(
    authClient as AdminAuthClient,
    userId
  )
  const [token, setToken] = useState<string>()
  const [tab, setTab] = useState("overview")
  const { languageTag } = useNativeLocale()
  const contributions = plugins.flatMap((plugin) => plugin.adminUserTabs ?? [])
  const target = user.data
  return (
    <AlertDialog
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <AlertDialog.Header>
        <AlertDialog.Heading>
          {target?.name ?? localization.userDetails}
        </AlertDialog.Heading>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <Tabs selectedKey={tab} onSelectionChange={setTab}>
          <Tabs.List aria-label={localization.userDetails}>
            <Tabs.Tab id="overview">{localization.overview}</Tabs.Tab>
            <Tabs.Tab id="sessions">{localization.sessions}</Tabs.Tab>
            {contributions.map((item) => (
              <Tabs.Tab key={item.id} id={item.id}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel id="overview">
            <Box className="gap-3">
              {user.isPending ? <Skeleton className="h-10 w-full" /> : null}
              {user.error ? (
                <Txt accessibilityRole="alert">{user.error.message}</Txt>
              ) : null}
              {target ? (
                <>
                  <CopyValue
                    value={target.id}
                    label={localization.copyUserId}
                  />
                  <Txt>{target.email}</Txt>
                  <Description>
                    {localization.emailVerified}: {String(target.emailVerified)}
                  </Description>
                  <Description>{target.role}</Description>
                  <Description>
                    {new Intl.DateTimeFormat(languageTag, {
                      dateStyle: "medium"
                    }).format(new Date(target.createdAt))}
                  </Description>
                  {target.banReason ? (
                    <Description>{target.banReason}</Description>
                  ) : null}
                  {target.banExpires ? (
                    <Description>
                      {new Intl.DateTimeFormat(languageTag, {
                        dateStyle: "medium"
                      }).format(new Date(target.banExpires))}
                    </Description>
                  ) : null}
                  {allowed.update ? (
                    <Button
                      onPress={() => onAction({ type: "edit", user: target })}
                    >
                      {localization.saveUser}
                    </Button>
                  ) : null}
                  {allowed.role ? (
                    <Button
                      onPress={() => onAction({ type: "role", user: target })}
                    >
                      {localization.saveRole}
                    </Button>
                  ) : null}
                  {allowed.password ? (
                    <Button
                      onPress={() =>
                        onAction({ type: "password", user: target })
                      }
                    >
                      {localization.setPassword}
                    </Button>
                  ) : null}
                  {allowed.ban ? (
                    <Button
                      onPress={() =>
                        onAction({
                          type: target.banned ? "unban" : "ban",
                          user: target
                        })
                      }
                    >
                      {target.banned
                        ? localization.unbanUser
                        : localization.banUser}
                    </Button>
                  ) : null}
                  {allowed.impersonate &&
                  (!isAdminTarget(target, adminRoles, adminUserIds) ||
                    allowed.impersonateAdmin) ? (
                    <Button
                      onPress={() =>
                        onAction({ type: "impersonate", user: target })
                      }
                    >
                      {localization.impersonateUser}
                    </Button>
                  ) : null}
                  {allowed.remove ? (
                    <Button
                      variant="danger"
                      onPress={() => onAction({ type: "remove", user: target })}
                    >
                      {localization.deleteUser}
                    </Button>
                  ) : null}
                </>
              ) : null}
            </Box>
          </Tabs.Panel>
          <Tabs.Panel id="sessions">
            <Box className="gap-3">
              {sessions.isPending && allowed.sessions ? (
                <Skeleton className="h-10 w-full" />
              ) : null}
              {sessions.error ? (
                <Txt accessibilityRole="alert">{sessions.error.message}</Txt>
              ) : null}
              {sessions.data?.sessions.length === 0 ? (
                <Description>{localization.noSessions}</Description>
              ) : null}
              {sessions.data?.sessions.map((session) => (
                <Card key={session.id} variant={variant}>
                  <Card.Content className="gap-2">
                    <Description>{session.userAgent}</Description>
                    {showIpAddress && session.ipAddress ? (
                      <Description>{session.ipAddress}</Description>
                    ) : null}
                    <Description>
                      {new Intl.DateTimeFormat(languageTag, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      }).format(new Date(session.createdAt))}
                    </Description>
                    {allowed.revoke ? (
                      <Button onPress={() => setToken(session.token)}>
                        {localization.revoke}
                      </Button>
                    ) : null}
                  </Card.Content>
                </Card>
              ))}
              {allowed.revoke ? (
                <Button
                  isDisabled={!sessions.data?.sessions.length}
                  onPress={() => setToken("all")}
                >
                  {localization.revokeAllSessions}
                </Button>
              ) : null}
            </Box>
          </Tabs.Panel>
          {contributions.map((item) => (
            <Tabs.Panel key={item.id} id={item.id}>
              <item.component userId={userId} />
            </Tabs.Panel>
          ))}
        </Tabs>
      </AlertDialog.Body>
      <AlertDialog.Footer>
        <Button onPress={onClose}>{localization.close}</Button>
      </AlertDialog.Footer>
      <AlertDialog
        isOpen={!!token}
        onOpenChange={(open) => {
          if (!open && !revoke.isPending && !revokeAll.isPending)
            setToken(undefined)
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {token === "all"
              ? localization.revokeAllSessions
              : localization.revoke}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <Button onPress={() => setToken(undefined)}>
            {localization.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={revoke.isPending || revokeAll.isPending}
            onPress={() => {
              if (!token) return
              if (token === "all")
                revokeAll.mutate(
                  { userId },
                  { onSuccess: () => setToken(undefined) }
                )
              else
                revoke.mutate(
                  { sessionToken: token },
                  { onSuccess: () => setToken(undefined) }
                )
            }}
          >
            {localization.revoke}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </AlertDialog>
  )
}

function AdminAction({
  action,
  onClose
}: {
  action: Action
  onClose: () => void
}) {
  const {
    authClient,
    localization: common,
    emailAndPassword,
    navigate,
    redirectTo
  } = useAuth()
  const {
    localization,
    roles,
    defaultRole,
    allowMultipleRoles,
    impersonationRedirectTo,
    adminRoles,
    adminUserIds
  } = useAuthPlugin(adminPlugin)
  const client = authClient as AdminAuthClient
  const allowed = useAdminActions()
  const create = useCreateAdminUser(client),
    update = useUpdateAdminUser(client),
    setRole = useSetAdminUserRole(client),
    password = useSetAdminUserPassword(client),
    ban = useBanAdminUser(client),
    unban = useUnbanAdminUser(client),
    remove = useRemoveAdminUser(client),
    impersonate = useImpersonateAdminUser(client)
  const pending = [
    create,
    update,
    setRole,
    password,
    ban,
    unban,
    remove,
    impersonate
  ].some((mutation) => mutation.isPending)
  const initial = action.type === "create" ? undefined : action.user
  const [selectedRoles, selectRoles] = useState(
    initial?.role?.split(",").filter(Boolean) ?? [defaultRole]
  )
  const form = useAuthForm({
    defaultValues: {
      name: initial?.name ?? "",
      email: initial?.email ?? "",
      password: "",
      banReason: "",
      banDuration: ""
    },
    onSubmit: async ({ value }) => {
      const userId = initial?.id ?? ""
      if (action.type === "create" && allowed.create)
        await create.mutateAsync({
          name: value.name.trim(),
          email: value.email.trim(),
          password: value.password,
          role: selectedRoles as Parameters<
            AdminAuthClient["admin"]["setRole"]
          >[0]["role"]
        })
      else if (action.type === "edit" && allowed.update)
        await update.mutateAsync({
          userId,
          data: { name: value.name.trim(), email: value.email.trim() }
        })
      else if (action.type === "role" && allowed.role)
        await setRole.mutateAsync({
          userId,
          role: selectedRoles as Parameters<
            AdminAuthClient["admin"]["setRole"]
          >[0]["role"]
        })
      else if (action.type === "password" && allowed.password) {
        try {
          await password.mutateAsync({ userId, newPassword: value.password })
        } finally {
          form.setFieldValue("password", "")
        }
      } else if (action.type === "ban" && allowed.ban)
        await ban.mutateAsync({
          userId,
          banReason: value.banReason.trim() || undefined,
          banExpiresIn: value.banDuration
            ? Number(value.banDuration) * 86400
            : undefined
        })
      else if (action.type === "unban" && allowed.ban)
        await unban.mutateAsync({ userId })
      else if (action.type === "remove" && allowed.remove)
        await remove.mutateAsync({ userId })
      else if (
        action.type === "impersonate" &&
        allowed.impersonate &&
        (!isAdminTarget(action.user, adminRoles, adminUserIds) ||
          allowed.impersonateAdmin)
      ) {
        await impersonate.mutateAsync({ userId })
        navigate({ to: impersonationRedirectTo ?? redirectTo })
      } else throw new Error(localization.accessDenied)
      onClose()
    }
  })
  const title = {
    create: localization.createUser,
    edit: localization.saveUser,
    role: localization.saveRole,
    password: localization.setPassword,
    ban: localization.banUser,
    unban: localization.unbanUser,
    remove: localization.deleteUser,
    impersonate: localization.impersonateUser
  }[action.type]
  return (
    <AlertDialog
      isOpen
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <AlertDialog.Header>
        <AlertDialog.Heading>{title}</AlertDialog.Heading>
      </AlertDialog.Header>
      <form.AppForm>
        <form.AuthFormRoot className="gap-4">
          <AlertDialog.Body>
            {action.type === "create" || action.type === "edit" ? (
              <>
                {(["name", "email"] as const).map((name) => (
                  <form.AppField
                    key={name}
                    name={name}
                    validators={{
                      onChange: ({ value }) =>
                        name === "email"
                          ? validateEmailAddress(value, {
                              requiredMessage: common.auth.fieldRequired,
                              invalidMessage: common.auth.invalidEmail
                            })
                          : validateStringLength(value, {
                              trim: true,
                              requiredMessage: common.auth.fieldRequired
                            })
                    }}
                  >
                    {(field) => (
                      <field.AuthFormTextField
                        label={localization[name]}
                        type={name === "email" ? "email" : "text"}
                        isDisabled={pending}
                      />
                    )}
                  </form.AppField>
                ))}
              </>
            ) : null}
            {action.type === "create" || action.type === "role" ? (
              <Box className="gap-2">
                <Txt>{localization.role}</Txt>
                {roles.map((role) => (
                  <Checkbox
                    key={role}
                    isSelected={selectedRoles.includes(role)}
                    isDisabled={pending}
                    onChange={(checked) =>
                      selectRoles(
                        allowMultipleRoles
                          ? checked
                            ? [...selectedRoles, role]
                            : selectedRoles.filter((value) => value !== role)
                          : [role]
                      )
                    }
                  >
                    {role}
                  </Checkbox>
                ))}
              </Box>
            ) : null}
            {action.type === "create" || action.type === "password" ? (
              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: common.auth.fieldRequired,
                      minLength: emailAndPassword.minPasswordLength,
                      minLengthMessage: common.auth.tooShort.replace(
                        "{{min}}",
                        String(emailAndPassword.minPasswordLength)
                      ),
                      maxLength: emailAndPassword.maxPasswordLength,
                      maxLengthMessage: common.auth.tooLong.replace(
                        "{{max}}",
                        String(emailAndPassword.maxPasswordLength)
                      )
                    })
                }}
              >
                {(field) => (
                  <field.AuthFormPasswordField
                    label={localization.password}
                    strengthMeter
                    isPending={pending}
                  />
                )}
              </form.AppField>
            ) : null}
            {action.type === "ban" ? (
              <>
                <form.AppField name="banReason">
                  {(field) => (
                    <field.AuthFormTextField
                      label={localization.banReason}
                      isDisabled={pending}
                    />
                  )}
                </form.AppField>
                <form.AppField
                  name="banDuration"
                  validators={{
                    onChange: ({ value }) =>
                      value &&
                      (!Number.isFinite(Number(value)) || Number(value) <= 0)
                        ? common.auth.fieldRequired
                        : undefined
                  }}
                >
                  {(field) => (
                    <field.AuthFormTextField
                      label={localization.banDuration}
                      isDisabled={pending}
                    />
                  )}
                </form.AppField>
                <Description>{localization.banDurationDescription}</Description>
              </>
            ) : null}
            {initial ? <Description>{initial.email}</Description> : null}
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button isDisabled={pending} onPress={onClose}>
              {localization.cancel}
            </Button>
            <form.AuthFormSubmitButton
              isPending={pending}
              isDisabled={
                (action.type === "create" || action.type === "role") &&
                !selectedRoles.length
              }
              variant={
                action.type === "remove" || action.type === "ban"
                  ? "danger"
                  : "primary"
              }
            >
              {title}
            </form.AuthFormSubmitButton>
          </AlertDialog.Footer>
        </form.AuthFormRoot>
      </form.AppForm>
    </AlertDialog>
  )
}
