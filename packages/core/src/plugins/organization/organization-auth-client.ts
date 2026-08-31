import type { organizationClient } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

export type OrganizationAuthClient = AuthClient<{
  plugins: [
    ReturnType<
      typeof organizationClient<{
        teams: { enabled: false }
        dynamicAccessControl: { enabled: false }
      }>
    >
  ]
}>

export type OrganizationTeamsAuthClient = AuthClient<{
  plugins: [ReturnType<typeof organizationClient<{ teams: { enabled: true } }>>]
}>

export type OrganizationRolesAuthClient = AuthClient<{
  plugins: [
    ReturnType<
      typeof organizationClient<{
        dynamicAccessControl: { enabled: true }
      }>
    >
  ]
}>
