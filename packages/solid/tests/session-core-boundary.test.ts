import * as core from "@better-auth-ui/core"
import * as coreServer from "@better-auth-ui/core/server"
import { QueryClient } from "@tanstack/solid-query"
import { createAuthClient } from "better-auth/client"
import { describe, expect, expectTypeOf, it } from "vitest"
import * as solid from "../src"

describe("Solid session core boundary", () => {
  it("keeps only the Solid hook in the framework root", () => {
    expect("useSession" in solid).toBe(true)
    expect("sessionOptions" in solid).toBe(false)
    expect("ensureSession" in solid).toBe(false)
    expect("prefetchSession" in solid).toBe(false)
    expect("fetchSession" in solid).toBe(false)
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
    const authClient = createAuthClient({ baseURL: "http://localhost" })
    const queryClient = new QueryClient()

    const cached = queryClient.getQueryData(
      core.sessionOptions(authClient).queryKey
    )

    expectTypeOf(cached).toEqualTypeOf<
      core.SessionData<typeof authClient> | undefined
    >()
  })
})
