import { describe, expect, it, vi } from "vitest"

import {
  agentAuthPlugin,
  agentAuthQueryKeys,
  createAgentAuthClientAdapter,
  revokeAgentCapabilityOptions
} from "../src/plugins/agent-auth"

const capabilityResponse = {
  capabilities: [
    {
      name: "invoices:read",
      description: "Read invoices",
      approval_strength: "session"
    },
    {
      name: "invoices:pay",
      description: "Pay invoices",
      approval_strength: "webauthn"
    }
  ]
}

const listedAgent = {
  agent_id: "agent-1",
  name: "Invoice assistant",
  status: "pending",
  mode: "delegated",
  host_id: "host-1",
  host_name: "Desktop agent",
  agent_capability_grants: [
    { capability: "invoices:read", status: "pending", reason: "Reconcile" },
    { capability: "invoices:pay", status: "active" }
  ],
  created_at: new Date("2026-08-19T10:00:00.000Z"),
  last_used_at: null,
  expires_at: null
}

function createClient() {
  return {
    capability: { list: vi.fn(async () => capabilityResponse) },
    agent: {
      list: vi.fn(async () => ({ agents: [listedAgent] })),
      get: vi.fn(async () => listedAgent),
      approveCapability: vi.fn(async () => ({ status: "active" })),
      revokeCapability: vi.fn(async () => ({
        agent_id: "agent-1",
        revoked: [],
        grant_ids: []
      }))
    }
  }
}

describe("Agent Auth", () => {
  it("joins pending grants with capability descriptions and strength", async () => {
    const client = createClient()
    const adapter = createAgentAuthClientAdapter(client as never)

    const approval = await adapter.getApproval({ agentId: "agent-1" })

    expect(approval.hostName).toBe("Desktop agent")
    expect(approval.requestedCapabilities).toEqual([
      expect.objectContaining({
        capability: "invoices:read",
        description: "Read invoices",
        approvalStrength: "session",
        reason: "Reconcile"
      })
    ])
  })

  it("completes WebAuthn and retries a protected approval", async () => {
    const client = createClient()
    client.agent.approveCapability
      .mockRejectedValueOnce({
        error: {
          error: "webauthn_required",
          webauthn_options: { challenge: "challenge-1" }
        }
      })
      .mockResolvedValueOnce({ status: "active" })
    const authenticateWithPasskey = vi.fn(async () => ({ id: "credential-1" }))
    const adapter = createAgentAuthClientAdapter(client as never, {
      authenticateWithPasskey
    })

    await adapter.approve({
      agentId: "agent-1",
      capabilities: ["invoices:pay"]
    })

    expect(authenticateWithPasskey).toHaveBeenCalledWith({
      challenge: "challenge-1"
    })
    expect(client.agent.approveCapability).toHaveBeenLastCalledWith(
      expect.objectContaining({
        action: "approve",
        webauthn_response: { id: "credential-1" }
      })
    )
  })

  it("loads every page of agent authorizations", async () => {
    const client = createClient()
    const firstPage = Array.from({ length: 100 }, (_, number) => ({
      ...listedAgent,
      agent_id: `agent-${number + 1}`
    }))
    const secondPage = [{ ...listedAgent, agent_id: "agent-101" }]
    client.agent.list.mockImplementation(async ({ query }) => ({
      agents: query.offset === 0 ? firstPage : secondPage
    }))
    const adapter = createAgentAuthClientAdapter(client as never)

    const authorizations = await adapter.listAgents()

    expect(authorizations).toHaveLength(101)
    expect(authorizations.at(-1)?.id).toBe("agent-101")
    expect(client.agent.list).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ query: { limit: 100, offset: 0 } })
    )
    expect(client.agent.list).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ query: { limit: 100, offset: 100 } })
    )
  })

  it("registers its route, settings default, and cache invalidation", async () => {
    const client = createClient()
    const adapter = createAgentAuthClientAdapter(client as never)
    const plugin = agentAuthPlugin({ adapter })
    const mutation = revokeAgentCapabilityOptions(adapter, "user-1")

    expect(plugin).toMatchObject({
      id: "agentAuth",
      grants: true,
      viewPaths: { auth: { agentApproval: "agent-approval" } }
    })
    await mutation.mutationFn?.({
      agentId: "agent-1",
      capability: "invoices:pay"
    })
    expect(client.agent.revokeCapability).toHaveBeenCalledWith(
      expect.objectContaining({
        agent_id: "agent-1",
        capabilities: ["invoices:pay"]
      })
    )
    expect(mutation.meta?.awaits).toEqual([agentAuthQueryKeys.all("user-1")])
  })
})
