import * as core from "@better-auth-ui/core"
import * as coreServer from "@better-auth-ui/core/server"
import { QueryClient } from "@tanstack/solid-query"
import { describe, expect, expectTypeOf, it } from "vitest"
import * as solid from "../src"

describe("Solid session core boundary", () => {
  it("keeps the Solid hook and transitional root helpers available", () => {
    expect("useSession" in solid).toBe(true)
    expect(solid.sessionOptions).toBe(core.sessionOptions)
    expect(solid.ensureSession).toBe(core.ensureSession)
    expect(solid.prefetchSession).toBe(core.prefetchSession)
    expect(solid.fetchSession).toBe(core.fetchSession)
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

  it("preserves DataTag query key inference for transitional Solid helpers", () => {
    type SessionResult = { session: { id: string }; user: { id: string } }
    const authClient = {
      getSession: async (): Promise<SessionResult> => ({
        session: { id: "session-1" },
        user: { id: "user-1" }
      })
    }
    const queryClient = new QueryClient()

    const cached = queryClient.getQueryData(
      solid.sessionOptions(authClient).queryKey
    )

    expectTypeOf(cached).toEqualTypeOf<SessionResult | undefined>()
  })
})
