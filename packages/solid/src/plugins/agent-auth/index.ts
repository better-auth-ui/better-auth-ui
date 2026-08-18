import {
  type AgentApprovalRequest,
  type AgentAuthAdapter,
  agentApprovalOptions,
  agentAuthorizationsOptions,
  approveAgentOptions,
  denyAgentOptions,
  revokeAgentCapabilityOptions
} from "@better-auth-ui/core/plugins/agent-auth"
import { type QueryClient, useMutation, useQuery } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export const useAgentApproval = (
  adapter: AgentAuthAdapter,
  request: Accessor<AgentApprovalRequest | undefined>,
  userId: Accessor<string | undefined>,
  queryClient?: Accessor<QueryClient>
) =>
  useQuery(
    () => agentApprovalOptions(adapter, request(), userId()),
    queryClient
  )

export const useAgentAuthorizations = (
  adapter: AgentAuthAdapter,
  userId: Accessor<string | undefined>,
  queryClient?: Accessor<QueryClient>
) => useQuery(() => agentAuthorizationsOptions(adapter, userId()), queryClient)

export const useApproveAgent = (
  adapter: AgentAuthAdapter,
  userId: Accessor<string | undefined>,
  queryClient?: Accessor<QueryClient>
) => useMutation(() => approveAgentOptions(adapter, userId()), queryClient)

export const useDenyAgent = (
  adapter: AgentAuthAdapter,
  userId: Accessor<string | undefined>,
  queryClient?: Accessor<QueryClient>
) => useMutation(() => denyAgentOptions(adapter, userId()), queryClient)

export const useRevokeAgentCapability = (
  adapter: AgentAuthAdapter,
  userId: Accessor<string | undefined>,
  queryClient?: Accessor<QueryClient>
) =>
  useMutation(
    () => revokeAgentCapabilityOptions(adapter, userId()),
    queryClient
  )
