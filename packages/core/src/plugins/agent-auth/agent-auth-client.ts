import type { AgentAuthClientPlugin } from "@better-auth/agent-auth/client"
import type { AuthClient } from "../../lib/auth-client"

export type AgentAuthClient = AuthClient<{
  plugins: [AgentAuthClientPlugin]
}>
