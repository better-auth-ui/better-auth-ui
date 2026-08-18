import { describe, expect, it } from "vitest"

import { AgentApproval } from "../src/components/auth/agent-auth/agent-approval"
import { AgentAuthorizations } from "../src/components/auth/agent-auth/agent-authorizations"
import { agentAuthPlugin } from "../src/lib/auth/agent-auth-plugin"

describe("agentAuthPlugin (heroui)", () => {
  it("registers the approval view and grant settings", () => {
    const plugin = agentAuthPlugin({ adapter: {} as never })

    expect(plugin.views?.auth?.agentApproval).toBe(AgentApproval)
    expect(plugin.securityCards).toEqual([AgentAuthorizations])
  })

  it("can hide grant settings without removing approval", () => {
    const plugin = agentAuthPlugin({ adapter: {} as never, grants: false })

    expect(plugin.views?.auth?.agentApproval).toBe(AgentApproval)
    expect(plugin.securityCards).toEqual([])
  })
})
