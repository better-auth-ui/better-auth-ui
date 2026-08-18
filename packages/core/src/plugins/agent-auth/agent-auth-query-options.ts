import { type QueryOptions, skipToken } from "@tanstack/query-core"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type {
  AgentApproval,
  AgentApprovalRequest,
  AgentAuthAdapter,
  AgentAuthorization
} from "./agent-auth-adapter"

export const agentAuthQueryKeys = {
  all: (userId?: string) =>
    [...authQueryKeys.user(userId), "agent-auth"] as const,
  approval: (request?: AgentApprovalRequest, userId?: string) =>
    [
      ...agentAuthQueryKeys.all(userId),
      "approval",
      request?.agentId,
      request?.approvalId,
      request?.userCode
    ] as const,
  agents: (userId?: string) =>
    [...agentAuthQueryKeys.all(userId), "agents"] as const
} as const

export const agentApprovalOptions = (
  adapter: AgentAuthAdapter,
  request: AgentApprovalRequest | undefined,
  userId?: string
) =>
  ({
    queryKey: agentAuthQueryKeys.approval(request, userId),
    queryFn:
      request && userId
        ? ({ signal }) => adapter.getApproval(request, signal)
        : skipToken
  }) satisfies QueryOptions<AgentApproval>

export const agentAuthorizationsOptions = (
  adapter: AgentAuthAdapter,
  userId?: string
) =>
  ({
    queryKey: agentAuthQueryKeys.agents(userId),
    queryFn: userId ? ({ signal }) => adapter.listAgents(signal) : skipToken
  }) satisfies QueryOptions<AgentAuthorization[]>
