import {
  formatDashEventName,
  getDashEventDetail,
  getDashEventLocation,
  getDashEventKey,
  type DashAuthClient
} from "@better-auth-ui/core/plugins/dash"
import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useDashAuditLogs,
  useDashAllAuditLogs,
  useDashUserAuditLogs
} from "@better-auth-ui/react/plugins/dash"
import { useActiveMemberRole } from "@better-auth-ui/react/plugins/organization"
import { keepPreviousData } from "@tanstack/react-query"
import { useState } from "react"
import { dashPlugin } from "../../../lib/auth/dash-plugin"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { useNativeLocale } from "../../../lib/native-locale"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { SearchField } from "../../../primitives/inputs-extra"
import { Select } from "../../../primitives/menu"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"

type ActivityFeedProps = CardSlotProps & {
  access: "user" | "organization" | "admin" | "admin-user"
  organizationId?: string
  userId?: string
}

function ActivityFeed({
  access,
  organizationId,
  userId,
  className,
  variant
}: ActivityFeedProps) {
  const { authClient } = useAuth()
  const { localization, pageSize, showIpAddress } = useAuthPlugin(dashPlugin)
  const { languageTag } = useNativeLocale()
  const [page, setPage] = useState(0)
  const [eventType, setEventType] = useState("all")
  const [identifier, setIdentifier] = useState("")
  const offset = page * pageSize
  const params = {
    limit: pageSize,
    offset,
    eventType: eventType === "all" ? undefined : eventType,
    identifier: identifier.trim() || undefined
  }
  const personal = useDashAuditLogs(authClient as DashAuthClient, {
    params: { ...params, organizationId },
    enabled: access === "user",
    placeholderData: keepPreviousData
  })
  const all = useDashAllAuditLogs(authClient as DashAuthClient, {
    params: { ...params, organizationId },
    enabled: access === "admin" || access === "organization",
    placeholderData: keepPreviousData
  })
  const user = useDashUserAuditLogs(authClient as DashAuthClient, userId, {
    params,
    enabled: access === "admin-user" && !!userId,
    placeholderData: keepPreviousData
  })
  const query =
    access === "user" ? personal : access === "admin-user" ? user : all
  const { data } = query
  const number = new Intl.NumberFormat(languageTag)
  return (
    <Box className={className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.activity}</Txt>
      <Description>
        {access === "admin-user"
          ? localization.adminUserActivityDescription
          : access === "admin"
            ? localization.adminActivityDescription
            : organizationId
              ? localization.organizationActivityDescription
              : localization.activityDescription}
      </Description>
      {organizationId ? (
        <Description>
          {access === "organization"
            ? localization.organizationWide
            : localization.personalOnly}
        </Description>
      ) : null}
      <Select
        label={localization.eventType}
        selectedKey={eventType}
        options={[
          { key: "all", label: localization.allEvents },
          ...Object.entries(localization.eventLabels).map(([key, label]) => ({
            key,
            label
          }))
        ]}
        onSelectionChange={(key) => {
          setEventType(key)
          setPage(0)
        }}
      />
      <SearchField
        value={identifier}
        onChangeText={(value) => {
          setIdentifier(value)
          setPage(0)
        }}
        placeholder={localization.identifierPlaceholder}
        aria-label={localization.identifier}
      />
      <Card variant={variant}>
        <Card.Content className="gap-4">
          {query.isPending ? <Skeleton className="h-20 w-full" /> : null}
          {query.error ? (
            <>
              <Txt accessibilityRole="alert">
                {localization.activityLoadError}
              </Txt>
              <Description>
                {localization.activityLoadErrorDescription}
              </Description>
              <Button
                onPress={() => {
                  void query.refetch()
                }}
              >
                {localization.retry}
              </Button>
            </>
          ) : null}
          {data?.events.length === 0 ? (
            <>
              <Txt>{localization.noActivity}</Txt>
              <Description>{localization.noActivityDescription}</Description>
            </>
          ) : null}
          {data?.events.map((event) => (
            <Box key={getDashEventKey(event)} className="gap-1">
              <Txt className="font-medium">
                {(localization.eventLabels as Record<string, string>)[
                  event.eventType
                ] ??
                  formatDashEventName(event.eventType) ??
                  localization.unknownEvent}
              </Txt>
              {getDashEventDetail(event) ? (
                <Description>{getDashEventDetail(event)}</Description>
              ) : null}
              <Description>
                {new Intl.DateTimeFormat(languageTag, {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(new Date(event.createdAt))}
              </Description>
              {getDashEventLocation(event, showIpAddress) ? (
                <Description>
                  {getDashEventLocation(event, showIpAddress)}
                </Description>
              ) : null}
            </Box>
          ))}
        </Card.Content>
        <Card.Footer className="gap-2">
          {data?.total ? (
            <Description>
              {localization.paginationRange
                .replace("{{from}}", number.format(offset + 1))
                .replace(
                  "{{to}}",
                  number.format(Math.min(offset + pageSize, data.total))
                )
                .replace("{{total}}", number.format(data.total))}
            </Description>
          ) : null}
          <Box className="flex-row gap-2">
            <Button
              isDisabled={query.isFetching || page === 0}
              onPress={() => setPage(page - 1)}
            >
              {localization.previousPage}
            </Button>
            <Button
              isDisabled={
                query.isFetching || !data || offset + pageSize >= data.total
              }
              onPress={() => setPage(page + 1)}
            >
              {localization.nextPage}
            </Button>
          </Box>
        </Card.Footer>
      </Card>
    </Box>
  )
}

export function UserActivity(props: CardSlotProps) {
  return <ActivityFeed access="user" {...props} />
}
export function AdminActivity(props: CardSlotProps) {
  return <ActivityFeed access="admin" {...props} />
}
export function AdminUserActivity(props: CardSlotProps & { userId: string }) {
  return <ActivityFeed key={props.userId} access="admin-user" {...props} />
}
export function OrganizationActivity({
  organizationId,
  ...props
}: CardSlotProps & { organizationId: string; organizationSlug: string }) {
  const { authClient } = useAuth()
  const { creatorRole } = useAuthPlugin(organizationPlugin)
  const role = useActiveMemberRole(authClient as OrganizationAuthClient, {
    query: { organizationId }
  })
  const permitted =
    hasMemberRole(role.data?.role, creatorRole) ||
    hasMemberRole(role.data?.role, "admin")
  return (
    <ActivityFeed
      key={organizationId}
      {...props}
      organizationId={organizationId}
      access={permitted ? "organization" : "user"}
    />
  )
}
