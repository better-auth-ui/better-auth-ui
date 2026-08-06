import { existsSync } from "node:fs"
import { join } from "node:path"
import type { ApiKeyAuthServer } from "@better-auth-ui/core/plugins/api-key/server"
import * as apiKeyServer from "@better-auth-ui/core/plugins/api-key/server"
import type { MultiSessionAuthServer } from "@better-auth-ui/core/plugins/multi-session/server"
import * as multiSessionServer from "@better-auth-ui/core/plugins/multi-session/server"
import type { OrganizationAuthServer } from "@better-auth-ui/core/plugins/organization/server"
import * as organizationServer from "@better-auth-ui/core/plugins/organization/server"
import type { PasskeyAuthServer } from "@better-auth-ui/core/plugins/passkey/server"
import * as passkeyServer from "@better-auth-ui/core/plugins/passkey/server"
import * as coreServer from "@better-auth-ui/core/server"
import { describe, expect, expectTypeOf, it } from "vitest"

const coreServerHelperExports = [
  "accountInfoOptions",
  "ensureAccountInfo",
  "ensureListAccounts",
  "ensureListSessions",
  "fetchAccountInfo",
  "fetchListAccounts",
  "fetchListSessions",
  "listAccountsOptions",
  "listSessionsOptions",
  "prefetchAccountInfo",
  "prefetchListAccounts",
  "prefetchListSessions",
  "sessionOptionsServer",
  "ensureSessionServer",
  "prefetchSessionServer",
  "fetchSessionServer"
] as const

const apiKeyServerHelperExports = [
  "ensureListApiKeys",
  "fetchListApiKeys",
  "listApiKeysOptions",
  "prefetchListApiKeys"
] as const

const multiSessionServerHelperExports = [
  "ensureListDeviceSessions",
  "fetchListDeviceSessions",
  "listDeviceSessionsOptions",
  "prefetchListDeviceSessions"
] as const

const organizationServerHelperExports = [
  "activeOrganizationOptions",
  "ensureActiveOrganization",
  "ensureFullOrganization",
  "ensureHasPermission",
  "ensureListOrganizationInvitations",
  "ensureListOrganizationMembers",
  "ensureListOrganizations",
  "ensureListUserInvitations",
  "fetchActiveOrganization",
  "fetchFullOrganization",
  "fetchHasPermission",
  "fetchListOrganizationInvitations",
  "fetchListOrganizationMembers",
  "fetchListOrganizations",
  "fetchListUserInvitations",
  "fullOrganizationOptions",
  "hasPermissionOptions",
  "listOrganizationInvitationsOptions",
  "listOrganizationMembersOptions",
  "listOrganizationsOptions",
  "listUserInvitationsOptions",
  "prefetchActiveOrganization",
  "prefetchFullOrganization",
  "prefetchHasPermission",
  "prefetchListOrganizationInvitations",
  "prefetchListOrganizationMembers",
  "prefetchListOrganizations",
  "prefetchListUserInvitations"
] as const

const passkeyServerHelperExports = [
  "ensureListPasskeys",
  "fetchListPasskeys",
  "listPasskeysOptions",
  "prefetchListPasskeys"
] as const

describe("server helper exports", () => {
  it("exposes base server-auth helpers from core/server", () => {
    for (const exportName of coreServerHelperExports) {
      expect(
        exportName in coreServer,
        `core/server exports ${exportName}`
      ).toBe(true)
    }
  })

  it("exposes plugin server-auth helpers from plugin server subpaths", () => {
    for (const exportName of apiKeyServerHelperExports) {
      expect(
        exportName in apiKeyServer,
        `api-key/server exports ${exportName}`
      ).toBe(true)
      expect(exportName in coreServer, `core/server omits ${exportName}`).toBe(
        false
      )
    }

    for (const exportName of multiSessionServerHelperExports) {
      expect(
        exportName in multiSessionServer,
        `multi-session/server exports ${exportName}`
      ).toBe(true)
      expect(exportName in coreServer, `core/server omits ${exportName}`).toBe(
        false
      )
    }

    for (const exportName of organizationServerHelperExports) {
      expect(
        exportName in organizationServer,
        `organization/server exports ${exportName}`
      ).toBe(true)
      expect(exportName in coreServer, `core/server omits ${exportName}`).toBe(
        false
      )
    }

    for (const exportName of passkeyServerHelperExports) {
      expect(
        exportName in passkeyServer,
        `passkey/server exports ${exportName}`
      ).toBe(true)
      expect(exportName in coreServer, `core/server omits ${exportName}`).toBe(
        false
      )
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
    expectTypeOf<MultiSessionAuthServer>().toHaveProperty("api")
    expectTypeOf<OrganizationAuthServer>().toHaveProperty("api")
    expectTypeOf<PasskeyAuthServer>().toHaveProperty("api")
  })
})
