import * as core from "@better-auth-ui/core"
import * as coreServer from "@better-auth-ui/core/server"
import { QueryClient } from "@tanstack/react-query"
import { describe, expect, expectTypeOf, it } from "vitest"
import * as react from "../src"

describe("React session core boundary", () => {
  it("keeps only the React hook in the framework root", () => {
    expect("useSession" in react).toBe(true)
    expect("sessionOptions" in react).toBe(false)
    expect("ensureSession" in react).toBe(false)
    expect("prefetchSession" in react).toBe(false)
    expect("fetchSession" in react).toBe(false)
  })

  it("exposes framework-agnostic session helpers from core", () => {
    expect("sessionOptions" in core).toBe(true)
    expect("ensureSession" in core).toBe(true)
    expect("prefetchSession" in core).toBe(true)
    expect("fetchSession" in core).toBe(true)
    expect("sessionOptionsServer" in coreServer).toBe(true)
    expect("ensureSessionServer" in coreServer).toBe(true)
    expect("prefetchSessionServer" in coreServer).toBe(true)
    expect("fetchSessionServer" in coreServer).toBe(true)
  })

  it("preserves DataTag query key inference for core session helpers", () => {
    type SessionResult = { session: { id: string }; user: { id: string } }
    const authClient = {
      getSession: async (): Promise<{ data: SessionResult }> => ({
        data: {
          session: { id: "session-1" },
          user: { id: "user-1" }
        }
      })
    }
    const queryClient = new QueryClient()

    const cached = queryClient.getQueryData(
      core.sessionOptions(authClient).queryKey
    )

    expectTypeOf(cached).toEqualTypeOf<SessionResult | undefined>()
  })
})
