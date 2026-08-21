import { skipToken } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import {
  type DashClientError,
  dashAllAuditLogsOptions,
  dashAuditLogsOptions,
  dashPlugin,
  dashQueryKeys,
  dashUserAuditLogsOptions,
  getDashEventDetail,
  getDashEventLocation
} from "../src/plugins/dash"

const response = {
  events: [],
  total: 0,
  limit: 20,
  offset: 0
}

const createAuthClient = () => ({
  dash: {
    getAuditLogs: vi.fn(async () => ({ data: response, error: null })),
    getAllAuditLogs: vi.fn(async () => ({ data: response, error: null }))
  }
})

describe("dashPlugin", () => {
  it("registers static personal and organization activity views", () => {
    expect(dashPlugin()).toMatchObject({
      id: "dash",
      admin: true,
      user: true,
      organization: true,
      pageSize: 20,
      showIpAddress: false,
      viewPaths: { settings: { activity: "activity" } }
    })

    expect(
      dashPlugin({
        admin: false,
        user: false,
        organization: true,
        pageSize: 250,
        path: "history"
      })
    ).toMatchObject({
      admin: false,
      user: false,
      organization: true,
      pageSize: 100,
      viewPaths: { settings: { activity: "history" } }
    })
    expect(dashPlugin({ pageSize: Number.NaN }).pageSize).toBe(20)
  })

  it("keeps each user and audit-log access level in separate caches", () => {
    const params = { organizationId: "org-1", limit: 20, offset: 0 }

    expect(dashQueryKeys.auditLogs("user-1", params)).not.toEqual(
      dashQueryKeys.auditLogs("user-2", params)
    )
    expect(dashQueryKeys.auditLogs("user-1", params)).not.toEqual(
      dashQueryKeys.allAuditLogs("user-1", params)
    )
    expect(
      dashQueryKeys.userAuditLogs("admin-1", "user-1", params)
    ).not.toEqual(dashQueryKeys.userAuditLogs("admin-1", "user-2", params))
  })

  it("waits for a session and forwards explicit organization filters", async () => {
    const authClient = createAuthClient()
    const params = { organizationId: "org-1", limit: 25, offset: 50 }

    expect(dashAuditLogsOptions(authClient as never).queryFn).toBe(skipToken)

    const options = dashAuditLogsOptions(authClient as never, "user-1", params)
    const data = await (options.queryFn as () => Promise<typeof response>)()

    expect(data).toBe(response)
    expect(authClient.dash.getAuditLogs).toHaveBeenCalledWith({
      ...params,
      userId: "user-1"
    })
  })

  it("uses the privileged endpoint only for all-audit-log queries", async () => {
    const authClient = createAuthClient()
    const params = { organizationId: "org-1" }
    const options = dashAllAuditLogsOptions(
      authClient as never,
      "user-1",
      params
    )

    await (options.queryFn as () => Promise<typeof response>)()

    expect(authClient.dash.getAllAuditLogs).toHaveBeenCalledWith({
      organizationId: "org-1"
    })
    expect(authClient.dash.getAuditLogs).not.toHaveBeenCalled()
  })

  it("uses the privileged endpoint for an inspected user", async () => {
    const authClient = createAuthClient()
    const params = { limit: 10, offset: 20 }

    expect(
      dashUserAuditLogsOptions(authClient as never, undefined, "user-2").queryFn
    ).toBe(skipToken)

    const options = dashUserAuditLogsOptions(
      authClient as never,
      "admin-1",
      "user-2",
      params
    )
    await (options.queryFn as () => Promise<typeof response>)()

    expect(authClient.dash.getAllAuditLogs).toHaveBeenCalledWith({
      ...params,
      userId: "user-2"
    })
    expect(authClient.dash.getAuditLogs).not.toHaveBeenCalled()
  })

  it("preserves Dash status details on failed queries", async () => {
    const authClient = createAuthClient()
    authClient.dash.getAuditLogs.mockResolvedValueOnce({
      data: null as never,
      error: { message: "Forbidden", status: 403, statusText: "Forbidden" }
    })
    const options = dashAuditLogsOptions(authClient as never, "user-1")

    await expect(
      (options.queryFn as () => Promise<typeof response>)()
    ).rejects.toMatchObject({
      name: "DashClientError",
      message: "Forbidden",
      status: 403,
      statusText: "Forbidden"
    } satisfies Partial<DashClientError>)
  })

  it("formats safe event details and keeps IP addresses opt-in", () => {
    const event = {
      eventType: "organization_member_role_updated",
      eventData: {
        memberEmail: "member@example.com",
        oldRole: "member",
        newRole: "admin"
      },
      eventKey: "event-1",
      projectId: "project-1",
      createdAt: "2026-08-21T08:00:00.000Z",
      updatedAt: "2026-08-21T08:00:00.000Z",
      location: {
        city: "Berlin",
        country: "Germany",
        ipAddress: "192.0.2.1"
      }
    }

    expect(getDashEventDetail(event)).toBe(
      "member@example.com · Member → Admin"
    )
    expect(getDashEventLocation(event)).toBe("Berlin, Germany")
    expect(getDashEventLocation(event, true)).toBe(
      "Berlin, Germany · 192.0.2.1"
    )
  })
})
