import {
  type AgentApprovalDecision,
  type AgentApprovalRequest,
  type AgentAuthAdapter,
  type AgentAuthClient,
  type AgentAuthorization,
  type RevokeAgentCapability,
  agentApprovalOptions,
  agentAuthorizationsOptions,
  approveAgentOptions,
  denyAgentOptions,
  revokeAgentCapabilityOptions
} from "@better-auth-ui/core/plugins/agent-auth"
import {
  type QueryClient,
  useMutation,
  type UseMutationResult,
  useQuery,
  type UseQueryResult
} from "@tanstack/react-query"
import { useSession } from "../../hooks/queries/use-session"

const useAgentUserId = (
  authClient: AgentAuthClient,
  queryClient?: QueryClient
) => useSession(authClient, undefined, queryClient).data?.user.id

export const useAgentApproval = (
  authClient: AgentAuthClient,
  adapter: AgentAuthAdapter,
  request?: AgentApprovalRequest,
  queryClient?: QueryClient
) => {
  const userId = useAgentUserId(authClient, queryClient)
  return useQuery(agentApprovalOptions(adapter, request, userId), queryClient)
}

export const useAgentAuthorizations = (
  authClient: AgentAuthClient,
  adapter: AgentAuthAdapter,
  queryClient?: QueryClient
): UseQueryResult<NoInfer<AgentAuthorization[]>> => {
  const userId = useAgentUserId(authClient, queryClient)
  return useQuery(agentAuthorizationsOptions(adapter, userId), queryClient)
}

export const useApproveAgent = (
  authClient: AgentAuthClient,
  adapter: AgentAuthAdapter,
  queryClient?: QueryClient
): UseMutationResult<void, Error, AgentApprovalDecision> => {
  const userId = useAgentUserId(authClient, queryClient)
  return useMutation(approveAgentOptions(adapter, userId), queryClient)
}

export const useDenyAgent = (
  authClient: AgentAuthClient,
  adapter: AgentAuthAdapter,
  queryClient?: QueryClient
): UseMutationResult<void, Error, AgentApprovalDecision> => {
  const userId = useAgentUserId(authClient, queryClient)
  return useMutation(denyAgentOptions(adapter, userId), queryClient)
}

export const useRevokeAgentCapability = (
  authClient: AgentAuthClient,
  adapter: AgentAuthAdapter,
  queryClient?: QueryClient
): UseMutationResult<void, Error, RevokeAgentCapability> => {
  const userId = useAgentUserId(authClient, queryClient)
  return useMutation(revokeAgentCapabilityOptions(adapter, userId), queryClient)
}
