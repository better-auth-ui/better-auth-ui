import { createAuthPlugin } from "../../lib/create-auth-plugin"
import type {} from "../../lib/view-paths"
import type { AgentAuthAdapter } from "./agent-auth-adapter"
import {
  type AgentAuthLocalization,
  agentAuthLocalization
} from "./agent-auth-localization"

declare module "../../lib/view-paths" {
  interface AuthViewPaths {
    /** @default "agent-approval" */
    agentApproval?: string
  }
}

export type AgentAuthPluginOptions = {
  adapter: AgentAuthAdapter
  localization?: Partial<AgentAuthLocalization>
  /** URL segment used by Agent Auth's `deviceAuthorizationPage`. @default "agent-approval" */
  path?: string
  /** Add agent grant management to security settings. @default true */
  grants?: boolean
}

export const agentAuthPlugin = createAuthPlugin(
  "agentAuth",
  (options: AgentAuthPluginOptions) => ({
    adapter: options.adapter,
    localization: { ...agentAuthLocalization, ...options.localization },
    grants: options.grants ?? true,
    viewPaths: {
      auth: { agentApproval: options.path ?? "agent-approval" }
    }
  })
)
