import type { MutationOptions } from "@tanstack/query-core"
import type {
  AgentApprovalDecision,
  AgentAuthAdapter
} from "./agent-auth-adapter"
import { agentAuthQueryKeys } from "./agent-auth-query-options"

export const agentAuthMutationKeys = {
  approve: ["auth", "agent-auth", "approve"] as const,
  deny: ["auth", "agent-auth", "deny"] as const,
  revoke: ["auth", "agent-auth", "revoke"] as const
} as const

const meta = (userId?: string) => ({
  awaits: [agentAuthQueryKeys.all(userId)]
})

export const approveAgentOptions = (
  adapter: AgentAuthAdapter,
  userId?: string
) =>
  ({
    mutationKey: agentAuthMutationKeys.approve,
    mutationFn: (decision: AgentApprovalDecision) => adapter.approve(decision),
    meta: meta(userId)
  }) satisfies MutationOptions<void, Error, AgentApprovalDecision>

export const denyAgentOptions = (adapter: AgentAuthAdapter, userId?: string) =>
  ({
    mutationKey: agentAuthMutationKeys.deny,
    mutationFn: (decision: AgentApprovalDecision) => adapter.deny(decision),
    meta: meta(userId)
  }) satisfies MutationOptions<void, Error, AgentApprovalDecision>

export type RevokeAgentCapability = {
  agentId: string
  capability: string
}

export const revokeAgentCapabilityOptions = (
  adapter: AgentAuthAdapter,
  userId?: string
) =>
  ({
    mutationKey: agentAuthMutationKeys.revoke,
    mutationFn: ({ agentId, capability }: RevokeAgentCapability) =>
      adapter.revoke(agentId, [capability]),
    meta: meta(userId)
  }) satisfies MutationOptions<void, Error, RevokeAgentCapability>
