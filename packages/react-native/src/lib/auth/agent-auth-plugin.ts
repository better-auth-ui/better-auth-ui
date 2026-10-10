import { createAuthPlugin } from "@better-auth-ui/core"
import {
  type AgentAuthPluginOptions,
  agentAuthPlugin as coreAgentAuthPlugin
} from "@better-auth-ui/core/plugins/agent-auth"

import { AgentApproval } from "../../components/auth/agent-auth/agent-approval"
import { AgentAuthorizations } from "../../components/auth/agent-auth/agent-authorizations"

export const agentAuthPlugin = createAuthPlugin(
  coreAgentAuthPlugin.id,
  (options: AgentAuthPluginOptions) => {
    const core = coreAgentAuthPlugin(options)
    return {
      ...core,
      views: { auth: { agentApproval: AgentApproval } },
      securityCards: core.grants ? [AgentAuthorizations] : []
    }
  }
)
