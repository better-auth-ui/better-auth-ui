"use client"

import {
  type DashAuditLog,
  type DashAuthClient,
  formatDashEventName,
  getDashEventDetail,
  getDashEventKey,
  getDashEventLocation
} from "@better-auth-ui/core/plugins/dash"
import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useDashAllAuditLogs,
  useDashAuditLogs,
  useDashUserAuditLogs
} from "@better-auth-ui/react/plugins/dash"
import { useActiveMemberRole } from "@better-auth-ui/react/plugins/organization"
import { keepPreviousData } from "@tanstack/react-query"
import {
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  MonitorDot,
  ShieldCheck,
  UserRound,
  Users
} from "lucide-react"
import { Fragment, useState } from "react"

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
  className?: string
  userId?: string
}

export type AdminUserActivityProps = {
  className?: string
  userId: string
}

export type UserActivityProps = { className?: string }

export type OrganizationActivityProps = {
  className?: string
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

function ActivityRow({ event }: { event: DashAuditLog }) {
  const { localization, showIpAddress } = useAuthPlugin(dashPlugin)
  const Icon = getEventIcon(event.eventType)
  const title =
    (localization.eventLabels as Record<string, string>)[event.eventType] ??
    formatDashEventName(event.eventType) ??
    localization.unknownEvent
  const detail = getDashEventDetail(event)
  const location = getDashEventLocation(event, showIpAddress)
  const absoluteTime = new Date(event.createdAt).toLocaleString()

  return (
    <li className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <p className="truncate text-sm font-medium">{title}</p>
          <time
            className="shrink-0 text-xs text-muted-foreground"
            dateTime={event.createdAt}
            title={absoluteTime}
          >
            {formatRelativeTime(event.createdAt)}
          </time>
        </div>
        {(detail || location) && (
          <p className="truncate text-xs text-muted-foreground">
            {[detail, location].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </li>
  )
}

function ActivityRowSkeleton() {
  return (
    <li className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
      <Skeleton className="size-9 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-52 max-w-full" />
      </div>
    </li>
  )
}

function ActivityFeed({
  access,
  organizationId,
  ready = true,
  className,
  userId
}: ActivityFeedProps) {
  const { authClient } = useAuth()
  const { localization, pageSize } = useAuthPlugin(dashPlugin)
  const [page, setPage] = useState(0)
  const offset = page * pageSize
  const params = { limit: pageSize, offset, organizationId }
  const userQuery = useDashAuditLogs(authClient as DashAuthClient, {
    enabled: ready && access === "user",
    params,
    placeholderData: keepPreviousData
  })
  const organizationQuery = useDashAllAuditLogs(authClient as DashAuthClient, {
    enabled: ready && access === "organization",
    params,
    placeholderData: keepPreviousData
  })
  const adminUserQuery = useDashUserAuditLogs(
    authClient as DashAuthClient,
    userId,
    {
      enabled: ready && access === "admin-user",
      params: { limit: pageSize, offset }
    }
  )
  const query =
    access === "organization"
      ? organizationQuery
      : access === "admin-user"
        ? adminUserQuery
        : userQuery
  const { data, error, isFetching, isPending } = query
  const showPending = !ready || isPending
  const pageEnd = offset + (data?.events.length ?? 0)
  const hasNextPage = pageEnd < (data?.total ?? 0)

  return (
    <Card
      className={cn("w-full", className)}
      aria-busy={showPending || isFetching}
    >
      <CardHeader>
        <CardTitle>{localization.activity}</CardTitle>
        <CardDescription>
          {access === "admin-user"
            ? localization.adminUserActivityDescription
            : organizationId
              ? localization.organizationActivityDescription
              : localization.activityDescription}
        </CardDescription>
        {organizationId && (
          <CardAction>
            <Badge variant="secondary">
              {access === "organization"
                ? localization.organizationWide
                : localization.personalOnly}
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        {showPending ? (
          <ul>
            {generateN(3).map((skeletonId, position) => (
              <Fragment key={skeletonId}>
                {position > 0 && <Separator />}
                <ActivityRowSkeleton />
              </Fragment>
            ))}
          </ul>
        ) : error ? (
          <Empty className="min-h-48 border-0 p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Activity />
              </EmptyMedia>
              <EmptyTitle>{localization.activityLoadError}</EmptyTitle>
              <EmptyDescription>
                {localization.activityLoadErrorDescription}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                size="sm"
                variant="outline"
                onClick={() => query.refetch()}
              >
                {localization.retry}
              </Button>
            </EmptyContent>
          </Empty>
        ) : data?.events.length ? (
          <ul>
            {data.events.map((event, position) => (
              <Fragment key={getDashEventKey(event)}>
                {position > 0 && <Separator />}
                <ActivityRow event={event} />
              </Fragment>
            ))}
          </ul>
        ) : (
          <Empty className="min-h-48 border-0 p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Activity />
              </EmptyMedia>
              <EmptyTitle>{localization.noActivity}</EmptyTitle>
              <EmptyDescription>
                {localization.noActivityDescription}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>

      {!error && !!data?.total && (
        <CardFooter className="justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs tabular-nums text-muted-foreground">
              {localization.paginationRange
                .replace("{{from}}", String(offset + 1))
                .replace("{{to}}", String(pageEnd))
                .replace("{{total}}", String(data.total))}
            </p>
            {isFetching && <Spinner />}
          </div>
          <div className="flex gap-1">
            <Button
              aria-label={localization.previousPage}
              disabled={isFetching || page === 0}
              size="icon-sm"
              variant="ghost"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              aria-label={localization.nextPage}
              disabled={isFetching || !hasNextPage}
              size="icon-sm"
              variant="ghost"
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

/** Authentication and account activity for a user selected by an administrator. */
export function AdminUserActivity(props: AdminUserActivityProps) {
  return <ActivityFeed key={props.userId} access="admin-user" {...props} />
}

/** Personal authentication and account activity. */
export function UserActivity(props: UserActivityProps) {
  return <ActivityFeed access="user" {...props} />
}

/** Activity for an explicit organization. */
export function OrganizationActivity({
  organizationId,
  organizationSlug: _organizationSlug,
  ...props
}: OrganizationActivityProps) {
  const { authClient } = useAuth()
  const { data: memberRole, isPending } = useActiveMemberRole(
    authClient as OrganizationAuthClient,
    { query: { organizationId } }
  )
  const canViewOrganization =
    hasMemberRole(memberRole?.role, "owner") ||
    hasMemberRole(memberRole?.role, "admin")

  if (isPending) {
    return (
      <ActivityFeed
        key={organizationId}
        access="user"
        organizationId={organizationId}
        ready={false}
        {...props}
      />
    )
  }

  return (
    <ActivityFeed
      key={organizationId}
      access={canViewOrganization ? "organization" : "user"}
      organizationId={organizationId}
      {...props}
    />
  )
}
