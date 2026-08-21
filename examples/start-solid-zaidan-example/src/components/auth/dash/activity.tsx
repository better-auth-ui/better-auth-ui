import {
  type DashAuditLog,
  type DashAuthClient,
  formatDashEventName,
  getDashEventDetail,
  getDashEventLocation
} from "@better-auth-ui/core/plugins/dash"
import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useDashAllAuditLogs,
  useDashAuditLogs,
  useDashUserAuditLogs
} from "@better-auth-ui/solid/plugins/dash"
import { useActiveMemberRole } from "@better-auth-ui/solid/plugins/organization"
import { keepPreviousData } from "@tanstack/solid-query"
import {
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  MonitorDot,
  ShieldCheck,
  UserRound,
  Users
} from "lucide-solid"
import { createEffect, createSignal, For, on, Show } from "solid-js"
import { Dynamic } from "solid-js/web"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { dashPlugin } from "@/lib/auth/dash-plugin"
import { cn } from "@/lib/utils"

type ActivityAccess = "admin-user" | "organization" | "user"

type ActivityFeedProps = {
  access: ActivityAccess
  organizationId?: string
  ready?: boolean
  class?: string
  userId?: string
}

export type AdminUserActivityProps = {
  class?: string
  userId: string
}

export type UserActivityProps = { class?: string }

export type OrganizationActivityProps = {
  class?: string
  organizationId: string
  organizationSlug: string
}

const generateN = (count: number) =>
  Array.from(
    { length: Math.max(0, Math.floor(count)) },
    (_, index) => index + 1
  )

const formatRelativeTime = (value: string) => {
  const date = new Date(value)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (!Number.isFinite(seconds)) return value

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1]
  ]

  for (const [unit, threshold] of units) {
    if (Math.abs(seconds) >= threshold) {
      return formatter.format(-Math.trunc(seconds / threshold), unit)
    }
  }

  return formatter.format(0, "second")
}

const getEventIcon = (eventType: string) => {
  if (
    eventType.includes("password") ||
    eventType.includes("two_factor") ||
    eventType.includes("banned") ||
    eventType === "user_sign_in_failed"
  ) {
    return ShieldCheck
  }
  if (eventType.startsWith("organization_member")) return Users
  if (eventType.startsWith("organization_")) return Building2
  if (eventType.includes("session") || eventType.includes("signed_")) {
    return MonitorDot
  }
  if (
    eventType.startsWith("user_") ||
    eventType.startsWith("profile_") ||
    eventType.startsWith("email_") ||
    eventType.startsWith("account_")
  ) {
    return UserRound
  }
  return Activity
}

function ActivityRow(props: { event: DashAuditLog }) {
  const { localization, showIpAddress } = useAuthPlugin(dashPlugin)
  const title = () =>
    (localization.eventLabels as Record<string, string>)[
      props.event.eventType
    ] ??
    formatDashEventName(props.event.eventType) ??
    localization.unknownEvent
  const detail = () => getDashEventDetail(props.event)
  const location = () => getDashEventLocation(props.event, showIpAddress)
  const metadata = () => [detail(), location()].filter(Boolean).join(" · ")
  const absoluteTime = () => new Date(props.event.createdAt).toLocaleString()

  return (
    <li class="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
      <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Dynamic
          component={getEventIcon(props.event.eventType)}
          class="size-4"
        />
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <div class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <p class="truncate text-sm font-medium">{title()}</p>
          <time
            class="shrink-0 text-xs text-muted-foreground"
            dateTime={props.event.createdAt}
            title={absoluteTime()}
          >
            {formatRelativeTime(props.event.createdAt)}
          </time>
        </div>
        <Show when={metadata()}>
          <p class="truncate text-xs text-muted-foreground">{metadata()}</p>
        </Show>
      </div>
    </li>
  )
}

function ActivityRowSkeleton() {
  return (
    <li class="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
      <Skeleton class="size-9 shrink-0 rounded-lg" />
      <div class="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
        <Skeleton class="h-4 w-36" />
        <Skeleton class="h-3 w-52 max-w-full" />
      </div>
    </li>
  )
}

function ActivityFeed(props: ActivityFeedProps) {
  const auth = useAuth()
  const { localization, pageSize } = useAuthPlugin(dashPlugin)
  const [page, setPage] = createSignal(0)
  createEffect(
    on(
      () => [props.access, props.organizationId, props.userId] as const,
      () => setPage(0),
      { defer: true }
    )
  )
  const offset = () => page() * pageSize
  const params = () => ({
    limit: pageSize,
    offset: offset(),
    organizationId: props.organizationId
  })
  const userQuery = useDashAuditLogs(auth.authClient as DashAuthClient, () => ({
    enabled: (props.ready ?? true) && props.access === "user",
    params: params(),
    placeholderData: keepPreviousData
  }))
  const organizationQuery = useDashAllAuditLogs(
    auth.authClient as DashAuthClient,
    () => ({
      enabled: (props.ready ?? true) && props.access === "organization",
      params: params(),
      placeholderData: keepPreviousData
    })
  )
  const adminUserQuery = useDashUserAuditLogs(
    auth.authClient as DashAuthClient,
    () => props.userId,
    () => ({
      enabled: (props.ready ?? true) && props.access === "admin-user",
      params: { limit: pageSize, offset: offset() }
    })
  )
  const query = () =>
    props.access === "organization"
      ? organizationQuery
      : props.access === "admin-user"
        ? adminUserQuery
        : userQuery
  const showPending = () => !(props.ready ?? true) || query().isPending
  const pageEnd = () => offset() + (query().data?.events.length ?? 0)
  const hasNextPage = () => pageEnd() < (query().data?.total ?? 0)

  return (
    <Card
      aria-busy={showPending() || query().isFetching}
      class={cn("w-full", props.class)}
    >
      <CardHeader>
        <CardTitle>{localization.activity}</CardTitle>
        <CardDescription>
          {props.access === "admin-user"
            ? localization.adminUserActivityDescription
            : props.organizationId
              ? localization.organizationActivityDescription
              : localization.activityDescription}
        </CardDescription>
        <Show when={props.organizationId}>
          <CardAction>
            <Badge variant="secondary">
              {props.access === "organization"
                ? localization.organizationWide
                : localization.personalOnly}
            </Badge>
          </CardAction>
        </Show>
      </CardHeader>

      <CardContent>
        <Show
          when={!showPending()}
          fallback={
            <ul>
              <For each={generateN(3)}>
                {(_skeletonId, position) => (
                  <>
                    <Show when={position() > 0}>
                      <Separator />
                    </Show>
                    <ActivityRowSkeleton />
                  </>
                )}
              </For>
            </ul>
          }
        >
          <Show
            when={!query().error}
            fallback={
              <Empty class="min-h-48 gap-4 p-4">
                <EmptyHeader class="gap-2">
                  <EmptyMedia variant="icon">
                    <Activity />
                  </EmptyMedia>
                  <EmptyTitle>{localization.activityLoadError}</EmptyTitle>
                  <EmptyDescription>
                    {localization.activityLoadErrorDescription}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent class="gap-2.5">
                  <Button
                    onClick={() => query().refetch()}
                    size="sm"
                    variant="outline"
                  >
                    {localization.retry}
                  </Button>
                </EmptyContent>
              </Empty>
            }
          >
            <Show
              when={query().data?.events.length}
              fallback={
                <Empty class="min-h-48 gap-4 p-4">
                  <EmptyHeader class="gap-2">
                    <EmptyMedia variant="icon">
                      <Activity />
                    </EmptyMedia>
                    <EmptyTitle>{localization.noActivity}</EmptyTitle>
                    <EmptyDescription>
                      {localization.noActivityDescription}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              }
            >
              <ul>
                <For each={query().data?.events ?? []}>
                  {(event, position) => (
                    <>
                      <Show when={position() > 0}>
                        <Separator />
                      </Show>
                      <ActivityRow event={event} />
                    </>
                  )}
                </For>
              </ul>
            </Show>
          </Show>
        </Show>
      </CardContent>

      <Show when={!query().error && !!query().data?.total}>
        <CardFooter class="justify-between gap-3">
          <div class="flex items-center gap-2">
            <p class="text-xs tabular-nums text-muted-foreground">
              {localization.paginationRange
                .replace("{{from}}", String(offset() + 1))
                .replace("{{to}}", String(pageEnd()))
                .replace("{{total}}", String(query().data?.total ?? 0))}
            </p>
            <Show when={query().isFetching}>
              <Spinner />
            </Show>
          </div>
          <div class="flex gap-1">
            <Button
              aria-label={localization.previousPage}
              disabled={query().isFetching || page() === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              size="icon-sm"
              variant="ghost"
            >
              <ChevronLeft />
            </Button>
            <Button
              aria-label={localization.nextPage}
              disabled={query().isFetching || !hasNextPage()}
              onClick={() => setPage((current) => current + 1)}
              size="icon-sm"
              variant="ghost"
            >
              <ChevronRight />
            </Button>
          </div>
        </CardFooter>
      </Show>
    </Card>
  )
}

/** Authentication and account activity for a user selected by an administrator. */
export function AdminUserActivity(props: AdminUserActivityProps) {
  return <ActivityFeed access="admin-user" {...props} />
}

/** Personal authentication and account activity. */
export function UserActivity(props: UserActivityProps) {
  return <ActivityFeed access="user" {...props} />
}

/** Activity for an explicit organization. */
export function OrganizationActivity(props: OrganizationActivityProps) {
  const auth = useAuth()
  const memberRole = useActiveMemberRole(
    auth.authClient as OrganizationAuthClient,
    () => ({ query: { organizationId: props.organizationId } })
  )
  const canViewOrganization = () =>
    hasMemberRole(memberRole.data?.role, "owner") ||
    hasMemberRole(memberRole.data?.role, "admin")

  return (
    <Show
      when={!memberRole.isPending}
      fallback={
        <ActivityFeed
          access="user"
          class={props.class}
          organizationId={props.organizationId}
          ready={false}
        />
      }
    >
      <ActivityFeed
        access={canViewOrganization() ? "organization" : "user"}
        class={props.class}
        organizationId={props.organizationId}
      />
    </Show>
  )
}
