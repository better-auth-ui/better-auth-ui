import { existsSync } from "node:fs"
import { join } from "node:path"
import type { ApiKeyAuthServer } from "@better-auth-ui/core/plugins/api-key/server"
import type { OrganizationAuthServer } from "@better-auth-ui/core/plugins/organization/server"
import * as coreServer from "@better-auth-ui/core/server"
import { describe, expect, expectTypeOf, it } from "vitest"

const serverHelperExports = [
  "accountInfoOptions",
  "activeOrganizationOptions",
  "ensureAccountInfo",
  "ensureActiveOrganization",
  "ensureFullOrganization",
  "ensureHasPermission",
  "ensureListAccounts",
  "ensureListApiKeys",
  "ensureListDeviceSessions",
  "ensureListOrganizationInvitations",
  "ensureListOrganizationMembers",
  "ensureListOrganizations",
  "ensureListPasskeys",
  "ensureListSessions",
  "ensureListUserInvitations",
  "fetchAccountInfo",
  "fetchActiveOrganization",
  "fetchFullOrganization",
  "fetchHasPermission",
  "fetchListAccounts",
  "fetchListApiKeys",
  "fetchListDeviceSessions",
  "fetchListOrganizationInvitations",
  "fetchListOrganizationMembers",
  "fetchListOrganizations",
  "fetchListPasskeys",
  "fetchListSessions",
  "fetchListUserInvitations",
  "fullOrganizationOptions",
  "hasPermissionOptions",
  "listAccountsOptions",
  "listApiKeysOptions",
  "listDeviceSessionsOptions",
  "listOrganizationInvitationsOptions",
  "listOrganizationMembersOptions",
  "listOrganizationsOptions",
  "listPasskeysOptions",
  "listSessionsOptions",
  "listUserInvitationsOptions",
  "prefetchAccountInfo",
  "prefetchActiveOrganization",
  "prefetchFullOrganization",
  "prefetchHasPermission",
  "prefetchListAccounts",
  "prefetchListApiKeys",
  "prefetchListDeviceSessions",
  "prefetchListOrganizationInvitations",
  "prefetchListOrganizationMembers",
  "prefetchListOrganizations",
  "prefetchListPasskeys",
  "prefetchListSessions",
  "prefetchListUserInvitations",
  "sessionOptionsServer",
  "ensureSessionServer",
  "prefetchSessionServer",
  "fetchSessionServer"
] as const

describe("server helper exports", () => {
  it("exposes true server-auth helpers from core/server", () => {
    for (const exportName of serverHelperExports) {
      expect(
        exportName in coreServer,
        `core/server exports ${exportName}`
      ).toBe(true)
    }
  })

  it("removes framework server entrypoints in favor of core/server", () => {
    expect(existsSync(join(process.cwd(), "../react/src/server.ts"))).toBe(
      false
    )
    expect(existsSync(join(process.cwd(), "src/server.ts"))).toBe(false)
  })

  it("keeps plugin-specific server auth types behind plugin server subpaths", () => {
    expectTypeOf<ApiKeyAuthServer>().toHaveProperty("api")
    expectTypeOf<OrganizationAuthServer>().toHaveProperty("api")
  })
})
