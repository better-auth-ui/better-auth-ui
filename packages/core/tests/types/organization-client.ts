import { QueryClient } from "@tanstack/query-core"
import { betterAuth } from "better-auth"
import { createAuthClient } from "better-auth/client"
import { organizationClient } from "better-auth/client/plugins"
import { organization } from "better-auth/plugins"
import {
  checkSlugOptions,
  createOrganizationOptions,
  createRoleOptions,
  createTeamOptions,
  ensureFullOrganization,
  ensureListOrganizations,
  fullOrganizationOptions,
  hasPermissionOptions,
  listOrganizationMembersOptions,
  listRolesOptions,
  listTeamsOptions,
  type OrganizationAuthClient,
  updateOrganizationOptions
} from "../../src/plugins/organization"
import { ensureFullOrganization as ensureServerOrganization } from "../../src/plugins/organization/server"

const basic = createAuthClient({ plugins: [organizationClient()] })
const teams = createAuthClient({
  plugins: [organizationClient({ teams: { enabled: true } })]
})
const roles = createAuthClient({
  plugins: [organizationClient({ dynamicAccessControl: { enabled: true } })]
})
const both = createAuthClient({
  plugins: [
    organizationClient({
      teams: { enabled: true },
      dynamicAccessControl: { enabled: true }
    })
  ]
})
const queryClient = new QueryClient()

function basicHelpers<T extends OrganizationAuthClient>(client: T) {
  ensureListOrganizations(queryClient, client, "user")
  ensureFullOrganization(queryClient, client, "user", {
    query: { organizationSlug: "acme" }
  })
  fullOrganizationOptions(client, "user")
  listOrganizationMembersOptions(client, "user")
  hasPermissionOptions(client, "user", {
    permissions: { organization: ["update"] }
  })
  createOrganizationOptions(client)
  updateOrganizationOptions(client)
  checkSlugOptions(client)
}

basicHelpers(basic)
basicHelpers(teams)
basicHelpers(roles)
basicHelpers(both)

listTeamsOptions(teams, "user")
listTeamsOptions(both, "user")
createTeamOptions(teams)
listRolesOptions(roles, "user")
listRolesOptions(both, "user")
createRoleOptions(roles)

// @ts-expect-error Team helpers require the teams capability.
listTeamsOptions(basic, "user")
// @ts-expect-error Dynamic roles do not enable teams.
createTeamOptions(roles)
// @ts-expect-error Role helpers require dynamic access control.
listRolesOptions(basic, "user")
// @ts-expect-error Teams do not enable dynamic roles.
createRoleOptions(teams)

const custom = createAuthClient({
  plugins: [
    organizationClient({
      schema: {
        organization: {
          additionalFields: { workspaceId: { type: "string", required: false } }
        }
      }
    })
  ]
})
basicHelpers(custom)
const customOrganization = await ensureFullOrganization(
  queryClient,
  custom,
  "user",
  { query: { organizationSlug: "acme" } }
)
customOrganization?.workspaceId satisfies string | undefined
// @ts-expect-error Custom field inference must not widen to any.
customOrganization?.workspaceId satisfies number

const server = betterAuth({ plugins: [organization()] })
ensureServerOrganization(queryClient, server, "user", {
  headers: new Headers(),
  query: { organizationSlug: "acme" }
})
