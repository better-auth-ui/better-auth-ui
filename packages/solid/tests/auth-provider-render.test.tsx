import { basePaths } from "@better-auth-ui/core"
import { renderToString } from "solid-js/web/dist/server"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider, useAuth } from "../src"

function AuthConsumer() {
  const auth = useAuth()

  return auth.basePaths.auth
}

describe("Solid AuthProvider render context", () => {
  it("provides auth context to children that consume useAuth during SSR", () => {
    const authClient = { getSession: vi.fn() }

    expect(
      renderToString(() => (
        <AuthProvider authClient={authClient as never}>
          {() => <AuthConsumer />}
        </AuthProvider>
      ))
    ).toContain(basePaths.auth)
  })
})
