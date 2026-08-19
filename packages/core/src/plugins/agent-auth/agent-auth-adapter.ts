import type { BetterFetchError } from "better-auth/client"
import type { AgentAuthClient } from "./agent-auth-client"

export type AgentApprovalStrength = "none" | "session" | "webauthn"
export type AgentGrantStatus = "active" | "pending" | "denied" | "revoked"

export type AgentCapabilityGrant = {
  capability: string
  description?: string
  status: AgentGrantStatus
  approvalStrength: AgentApprovalStrength
  reason?: string
  constraints?: Record<string, unknown>
  expiresAt?: Date
}

export type AgentAuthorization = {
  id: string
  name: string
  status: string
  mode: "delegated" | "autonomous"
  hostId: string
  hostName?: string
  grants: AgentCapabilityGrant[]
  createdAt: Date
  lastUsedAt?: Date
  expiresAt?: Date
}

export type AgentApprovalRequest = {
  agentId: string
  approvalId?: string
  userCode?: string
}

export type AgentApproval = AgentAuthorization & {
  requestedCapabilities: AgentCapabilityGrant[]
}

export type AgentApprovalDecision = AgentApprovalRequest & {
  capabilities?: string[]
  ttl?: number
  reason?: string
}

export type AgentAuthPasskeyCeremony = (
  options: Record<string, unknown>
) => Promise<Record<string, unknown>>

export interface AgentAuthAdapter {
  getApproval(
    request: AgentApprovalRequest,
    signal?: AbortSignal
  ): Promise<AgentApproval>
  approve(decision: AgentApprovalDecision): Promise<void>
  deny(decision: AgentApprovalDecision): Promise<void>
  listAgents(signal?: AbortSignal): Promise<AgentAuthorization[]>
  revoke(agentId: string, capabilities: string[]): Promise<void>
}

export type AgentAuthClientAdapterOptions = {
  authenticateWithPasskey?: AgentAuthPasskeyCeremony
}

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {}

const unwrapData = (value: unknown) => {
  const record = asRecord(value)
  return "data" in record ? record.data : value
}

const asDate = (value: unknown) => {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date
}

const asStrength = (value: unknown): AgentApprovalStrength =>
  value === "webauthn" || value === "session" ? value : "none"

const asStatus = (value: unknown): AgentGrantStatus =>
  value === "active" ||
  value === "denied" ||
  value === "revoked" ||
  value === "pending"
    ? value
    : "pending"

const fetchOptions = (signal?: AbortSignal) => ({ throw: true, signal })

function errorBody(error: unknown) {
  const fetchError = error as BetterFetchError & {
    error?: UnknownRecord
    body?: UnknownRecord
  }
  return asRecord(fetchError.error ?? fetchError.body)
}

function normalizeGrant(
  value: unknown,
  capabilities: Map<string, UnknownRecord>
): AgentCapabilityGrant {
  const grant = asRecord(value)
  const capability = String(grant.capability ?? "")
  const definition = capabilities.get(capability) ?? {}

  return {
    capability,
    status: asStatus(grant.status),
    description:
      typeof grant.description === "string"
        ? grant.description
        : typeof definition.description === "string"
          ? definition.description
          : undefined,
    approvalStrength: asStrength(definition.approval_strength),
    reason: typeof grant.reason === "string" ? grant.reason : undefined,
    constraints:
      grant.constraints && typeof grant.constraints === "object"
        ? asRecord(grant.constraints)
        : undefined,
    expiresAt: asDate(grant.expires_at)
  }
}

function normalizeAgent(
  value: UnknownRecord,
  capabilities: Map<string, UnknownRecord>,
  hostName?: string
): AgentAuthorization {
  return {
    id: String(value.agent_id ?? ""),
    name: String(value.name ?? "Agent"),
    status: String(value.status ?? "pending"),
    mode: value.mode === "autonomous" ? "autonomous" : "delegated",
    hostId: String(value.host_id ?? ""),
    hostName:
      hostName ??
      (typeof value.host_name === "string" ? value.host_name : undefined),
    grants: Array.isArray(value.agent_capability_grants)
      ? value.agent_capability_grants
          .map((grant) => normalizeGrant(grant, capabilities))
          .filter((grant) => grant.capability)
      : [],
    createdAt: asDate(value.created_at) ?? new Date(0),
    lastUsedAt: asDate(value.last_used_at),
    expiresAt: asDate(value.expires_at)
  }
}

/** Build BAUI's approval and grant-management adapter from Agent Auth's native client. */
export function createAgentAuthClientAdapter(
  authClient: AgentAuthClient,
  options: AgentAuthClientAdapterOptions = {}
): AgentAuthAdapter {
  const listCapabilities = async (signal?: AbortSignal) => {
    const response = await authClient.capability.list({
      query: { limit: 100 },
      fetchOptions: fetchOptions(signal)
    })
    const capabilities = asRecord(unwrapData(response)).capabilities
    return new Map(
      (Array.isArray(capabilities) ? capabilities : []).map(
        (value: unknown) => {
          const capability = asRecord(value)
          return [String(capability.name ?? ""), capability] as const
        }
      )
    )
  }

  const fetchAgents = async (signal?: AbortSignal): Promise<unknown[]> => {
    const pageSize = 100
    const agents: unknown[] = []

    for (let offset = 0; ; offset += pageSize) {
      const response = await authClient.agent.list({
        query: { limit: pageSize, offset },
        fetchOptions: fetchOptions(signal)
      })
      const result = asRecord(unwrapData(response)).agents
      const page = Array.isArray(result) ? result : []
      agents.push(...page)

      if (page.length < pageSize) return agents
    }
  }

  const listAgents = async (signal?: AbortSignal) => {
    const [agents, capabilities] = await Promise.all([
      fetchAgents(signal),
      listCapabilities(signal)
    ])

    return agents.map((agent: unknown) =>
      normalizeAgent(asRecord(agent), capabilities)
    )
  }

  const decide = async (
    action: "approve" | "deny",
    decision: AgentApprovalDecision
  ) => {
    const body = {
      agent_id: decision.agentId,
      approval_id: decision.approvalId,
      user_code: decision.userCode,
      action,
      capabilities: decision.capabilities,
      ttl: decision.ttl,
      reason: decision.reason
    }

    try {
      await authClient.agent.approveCapability({
        ...body,
        fetchOptions: fetchOptions()
      })
    } catch (error) {
      const response = errorBody(error)
      if (response.error !== "webauthn_required") throw error
      if (!options.authenticateWithPasskey) {
        throw new Error(
          "This approval requires a passkey. Configure authenticateWithPasskey on the Agent Auth adapter."
        )
      }

      const webauthnResponse = await options.authenticateWithPasskey(
        asRecord(response.webauthn_options)
      )
      await authClient.agent.approveCapability({
        ...body,
        webauthn_response: webauthnResponse,
        fetchOptions: fetchOptions()
      })
    }
  }

  return {
    async getApproval(request, signal) {
      const [agentResponse, listedAgents, capabilities] = await Promise.all([
        authClient.agent.get({
          query: { agent_id: request.agentId },
          fetchOptions: fetchOptions(signal)
        }),
        fetchAgents(signal),
        listCapabilities(signal)
      ])
      const summary = listedAgents
        .map((agent: unknown) => asRecord(agent))
        .find(
          (agent: UnknownRecord) =>
            String(agent.agent_id ?? "") === request.agentId
        )
      const agent = normalizeAgent(
        asRecord(unwrapData(agentResponse)),
        capabilities,
        typeof summary?.host_name === "string" ? summary.host_name : undefined
      )

      return {
        ...agent,
        requestedCapabilities: agent.grants.filter(
          (grant) => grant.status === "pending"
        )
      }
    },
    approve: (decision) => decide("approve", decision),
    deny: (decision) => decide("deny", decision),
    listAgents,
    async revoke(agentId, capabilities) {
      await authClient.agent.revokeCapability({
        agent_id: agentId,
        capabilities,
        fetchOptions: fetchOptions()
      })
    }
  }
}
