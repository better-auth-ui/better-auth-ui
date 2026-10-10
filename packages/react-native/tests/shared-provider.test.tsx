import { AuthProvider, useAuth } from "@better-auth-ui/react"
import { QueryClient } from "@tanstack/react-query"
import { renderToString } from "react-dom/server"
import { afterEach, expect, it, vi } from "vitest"

afterEach(() => vi.unstubAllGlobals())

it("reads the configured redirect in a native runtime with window but no location", () => {
  let redirect: string | undefined
  function ReadRedirect() {
    redirect = useAuth().redirectTo
    return null
  }

  vi.stubGlobal("window", {})
  renderToString(
    <AuthProvider
      authClient={{} as Parameters<typeof AuthProvider>[0]["authClient"]}
      navigate={() => {}}
      redirectTo="/dashboard"
      queryClient={new QueryClient()}
    >
      <ReadRedirect />
    </AuthProvider>
  )
  expect(redirect).toBe("/dashboard")
})
