import type { DashAuditLog } from "@better-auth/infra/client"

const getString = (data: Record<string, unknown>, key: string) => {
  const value = data[key]
  return typeof value === "string" && value && value !== "unknown"
    ? value
    : undefined
}

export const formatDashEventName = (value?: string) => {
  if (!value) return undefined
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

/** A short, non-sensitive detail for a known Dash audit-log event. */
export const getDashEventDetail = (event: DashAuditLog) => {
  const { eventData } = event
  const member =
    getString(eventData, "memberName") ?? getString(eventData, "memberEmail")
  const invitee = getString(eventData, "inviteeEmail")
  const team = getString(eventData, "teamName")
  const organization = getString(eventData, "organizationName")

  switch (event.eventType) {
    case "account_linked":
    case "account_unlinked":
      return formatDashEventName(getString(eventData, "providerId"))
    case "user_signed_in":
    case "user_signed_out":
    case "user_sign_in_failed":
    case "session_created":
    case "session_revoked":
      return formatDashEventName(getString(eventData, "loginMethod"))
    case "organization_member_added":
    case "organization_member_removed":
      return member
    case "organization_member_role_updated": {
      const oldRole = formatDashEventName(getString(eventData, "oldRole"))
      const newRole = formatDashEventName(getString(eventData, "newRole"))
      const roleChange =
        oldRole && newRole ? `${oldRole} → ${newRole}` : (newRole ?? oldRole)
      return [member, roleChange].filter(Boolean).join(" · ") || undefined
    }
    case "organization_member_invited":
    case "organization_member_invite_accepted":
    case "organization_member_invite_canceled":
    case "organization_member_invite_rejected":
      return invitee
    case "organization_team_created":
    case "organization_team_updated":
    case "organization_team_deleted":
    case "organization_team_member_added":
    case "organization_team_member_removed":
      return team
    case "organization_created":
    case "organization_updated":
      return organization
    case "user_banned":
    case "user_unbanned":
    case "user_deleted":
    case "user_impersonated":
    case "user_impersonated_stopped":
      return (
        getString(eventData, "userName") ?? getString(eventData, "userEmail")
      )
    default:
      return undefined
  }
}

/** Format the stored event location, with IP addresses opt-in. */
export const getDashEventLocation = (
  event: DashAuditLog,
  showIpAddress = false
) => {
  const place = [event.location?.city, event.location?.country]
    .filter(Boolean)
    .filter((value, position, values) => values.indexOf(value) === position)
    .join(", ")
  const ipAddress = showIpAddress ? event.location?.ipAddress : undefined

  return [place || undefined, ipAddress].filter(Boolean).join(" · ")
}

/** Stable identity for an audit-log row. */
export const getDashEventKey = (event: DashAuditLog) =>
  [
    event.projectId,
    event.eventKey,
    event.eventType,
    event.createdAt,
    event.updatedAt
  ].join(":")
