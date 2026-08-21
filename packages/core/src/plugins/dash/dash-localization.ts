export const dashEventLabels = {
  account_linked: "Account linked",
  account_unlinked: "Account unlinked",
  all_sessions_revoked: "All sessions revoked",
  email_changed: "Email changed",
  email_verification_sent: "Verification email sent",
  email_verified: "Email verified",
  organization_created: "Organization created",
  organization_member_added: "Member added",
  organization_member_invite_accepted: "Invitation accepted",
  organization_member_invite_canceled: "Invitation canceled",
  organization_member_invite_rejected: "Invitation rejected",
  organization_member_invited: "Member invited",
  organization_member_removed: "Member removed",
  organization_member_role_updated: "Member role updated",
  organization_team_created: "Team created",
  organization_team_deleted: "Team deleted",
  organization_team_member_added: "Team member added",
  organization_team_member_removed: "Team member removed",
  organization_team_updated: "Team updated",
  organization_updated: "Organization updated",
  password_changed: "Password changed",
  password_reset_completed: "Password reset completed",
  password_reset_requested: "Password reset requested",
  profile_image_updated: "Profile image updated",
  profile_updated: "Profile updated",
  session_created: "Session created",
  session_revoked: "Session revoked",
  two_factor_disabled: "Two-factor authentication disabled",
  two_factor_enabled: "Two-factor authentication enabled",
  two_factor_verified: "Two-factor authentication verified",
  user_banned: "User banned",
  user_created: "Account created",
  user_deleted: "User deleted",
  user_impersonated: "User impersonated",
  user_impersonated_stopped: "User impersonation stopped",
  user_sign_in_failed: "Sign-in failed",
  user_signed_in: "Signed in",
  user_signed_out: "Signed out",
  user_unbanned: "User unbanned"
} as const

export const dashLocalization = {
  activity: "Activity",
  activityDescription: "Review recent authentication and account activity.",
  organizationActivityDescription:
    "Review activity you can access for this organization.",
  organizationWide: "Organization-wide",
  personalOnly: "Your activity",
  noActivity: "No retained activity",
  noActivityDescription: "No retained activity matches this view.",
  activityLoadError: "Activity could not be loaded",
  activityLoadErrorDescription:
    "Check the Dash client configuration, then try again.",
  retry: "Try again",
  paginationRange: "{{from}}–{{to}} of {{total}}",
  previousPage: "Previous page",
  nextPage: "Next page",
  unknownEvent: "Activity event",
  eventLabels: dashEventLabels
}

export type DashLocalization = typeof dashLocalization

export type DashLocalizationOverrides = Partial<
  Omit<DashLocalization, "eventLabels">
> & {
  eventLabels?: Partial<Record<string, string>>
}
