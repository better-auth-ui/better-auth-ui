"use client"

import type {
  DashAuditLog,
  DashAuthClient
} from "@better-auth-ui/core/plugins/dash"
import {
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
import {
  ChevronLeft,
  ChevronRight,
  DisplayPulse,
  Gear,
  Person,
  Persons,
  Pulse,
  Shield
} from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  Chip,
  cn,
  Skeleton,
  Spinner
} from "@heroui/react"
import { keepPreviousData } from "@tanstack/react-query"
import { useState } from "react"
import { dashPlugin } from "../../../lib/auth/dash-plugin"

type ActivityAccess = "admin-user" | "organization" | "user"

type ActivityFeedProps = {
  access: ActivityAccess
  organizationId?: string
  ready?: boolean
  className?: string
  userId?: string
  variant?: CardProps["variant"]
}

export type AdminUserActivityProps = {
  className?: string
  userId: string
  variant?: CardProps["variant"]
}

export type UserActivityProps = {
  className?: string
  variant?: CardProps["variant"]
}

export type OrganizationActivityProps = {
  className?: string
  organizationId: string
  organizationSlug: string
  variant?: CardProps["variant"]
}

const generateN = (count: number) =>
  Array.from(
    { length: Math.max(0, Math.floor(count)) },
    (_, index) => index + 1
  )

const formatRelativeTime = (value: string, languageTag: string) => {
  const date = new Date(value)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (!Number.isFinite(seconds)) return value

  const formatter = new Intl.RelativeTimeFormat(languageTag, {
    numeric: "auto"
  })
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
    return Shield
  }
  if (eventType.startsWith("organization_member")) return Persons
  if (eventType.startsWith("organization_")) return Gear
  if (eventType.includes("session") || eventType.includes("signed_")) {
    return DisplayPulse
  }
  if (
    eventType.startsWith("user_") ||
    eventType.startsWith("profile_") ||
    eventType.startsWith("email_") ||
    eventType.startsWith("account_")
  ) {
    return Person
  }
  return Pulse
}

function ActivityRow({ event }: { event: DashAuditLog }) {
  const { locale } = useAuth()
  const { localization, showIpAddress } = useAuthPlugin(dashPlugin)
  const Icon = getEventIcon(event.eventType)
  const title =
    (localization.eventLabels as Record<string, string>)[event.eventType] ??
    formatDashEventName(event.eventType) ??
    localization.unknownEvent
  const detail = getDashEventDetail(event)
  const location = getDashEventLocation(event, showIpAddress)
  const absoluteTime = new Date(event.createdAt).toLocaleString(
    locale.languageTag
  )

  return (
    <li className="flex items-start gap-3 border-b border-dashed py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        <Icon className="size-4 text-muted" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <p className="truncate text-sm font-medium">{title}</p>
          <time
            className="shrink-0 text-xs text-muted"
            dateTime={event.createdAt}
            title={absoluteTime}
          >
            {formatRelativeTime(event.createdAt, locale.languageTag)}
          </time>
        </div>

        {(detail || location) && (
          <p className="truncate text-xs text-muted">
            {[detail, location].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </li>
  )
}

function ActivityRowSkeleton() {
  return (
    <li className="flex items-start gap-3 border-b border-dashed py-4 first:pt-0 last:border-b-0 last:pb-0">
      <Skeleton className="size-9 shrink-0 rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
        <Skeleton className="h-4 w-36 rounded-lg" />
        <Skeleton className="h-3 w-52 max-w-full rounded-lg" />
      </div>
    </li>
  )
}

function ActivityFeed({
  access,
  organizationId,
  ready = true,
  className,
  userId,
  variant
}: ActivityFeedProps) {
  const { authClient, locale } = useAuth()
  const { localization, pageSize } = useAuthPlugin(dashPlugin)
  const [page, setPage] = useState(0)
  const numberFormatter = new Intl.NumberFormat(locale.languageTag)
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
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-sm font-semibold">{localization.activity}</h2>
          <p className="text-sm text-muted">
            {access === "admin-user"
              ? localization.adminUserActivityDescription
              : organizationId
                ? localization.organizationActivityDescription
                : localization.activityDescription}
          </p>
        </div>

        {organizationId && (
          <Chip className="shrink-0" size="sm" variant="secondary">
            {access === "organization"
              ? localization.organizationWide
              : localization.personalOnly}
          </Chip>
        )}
      </div>

      <Card variant={variant} aria-busy={showPending || isFetching}>
        <Card.Content>
          {showPending ? (
            <ul>
              {generateN(3).map((skeletonId) => (
                <ActivityRowSkeleton key={skeletonId} />
              ))}
            </ul>
          ) : error ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-surface-secondary">
                <Pulse className="size-4 text-muted" />
              </div>
              <div className="flex max-w-sm flex-col gap-1">
                <p className="text-sm font-medium">
                  {localization.activityLoadError}
                </p>
                <p className="text-xs text-muted">
                  {localization.activityLoadErrorDescription}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => query.refetch()}
              >
                {localization.retry}
              </Button>
            </div>
          ) : data?.events.length ? (
            <ul>
              {data.events.map((event) => (
                <ActivityRow key={getDashEventKey(event)} event={event} />
              ))}
            </ul>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-surface-secondary">
                <Pulse className="size-4 text-muted" />
              </div>
              <div className="flex max-w-sm flex-col gap-1">
                <p className="text-sm font-medium">{localization.noActivity}</p>
                <p className="text-xs text-muted">
                  {localization.noActivityDescription}
                </p>
              </div>
            </div>
          )}
        </Card.Content>

        {!error && !!data?.total && (
          <Card.Footer className="flex-row items-center justify-between gap-3 border-t border-dashed">
            <div className="flex items-center gap-2">
              <p className="text-xs tabular-nums text-muted">
                {localization.paginationRange
                  .replace("{{from}}", numberFormatter.format(offset + 1))
                  .replace("{{to}}", numberFormatter.format(pageEnd))
                  .replace("{{total}}", numberFormatter.format(data.total))}
              </p>
              {isFetching && <Spinner size="sm" color="current" />}
            </div>

            <div className="flex gap-1">
              <Button
                isIconOnly
                aria-label={localization.previousPage}
                size="sm"
                variant="ghost"
                isDisabled={isFetching || page === 0}
                onPress={() => setPage((current) => Math.max(0, current - 1))}
              >
                <ChevronLeft />
              </Button>
              <Button
                isIconOnly
                aria-label={localization.nextPage}
                size="sm"
                variant="ghost"
                isDisabled={isFetching || !hasNextPage}
                onPress={() => setPage((current) => current + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>
    </div>
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
