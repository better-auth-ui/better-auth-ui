import { basePaths, createAuthPlugin } from "@better-auth-ui/core"
import { renderToString } from "solid-js/web"
import { describe, expect, it, vi } from "vitest"

import {
  AuthLink,
  type AuthLinkProps,
  AuthProvider,
  useAuth,
  useAuthPlugin
} from "../src"

function AuthConsumer() {
  const auth = useAuth()

  return auth.basePaths.auth
}

const testPlugin = createAuthPlugin("test", (label: string) => ({ label }))

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

  it("returns the registered plugin from the provider context", () => {
    const authClient = { getSession: vi.fn() }
    const registeredPlugin = testPlugin("Registered plugin")
    let resolvedPlugin: typeof registeredPlugin | undefined

    function PluginConsumer() {
      resolvedPlugin = useAuthPlugin(testPlugin)
      return null
    }

    renderToString(() => (
      <AuthProvider
        authClient={authClient as never}
        plugins={[registeredPlugin]}
      >
        {() => <PluginConsumer />}
      </AuthProvider>
    ))

    expect(resolvedPlugin).toBe(registeredPlugin)
  })

  it("renders internal links through the configured router adapter", () => {
    const authClient = { getSession: vi.fn() }
    let receivedHref: string | undefined

    function Link(props: AuthLinkProps) {
      receivedHref = props.href
      return props.children
    }

    renderToString(() => (
      <AuthProvider authClient={authClient as never} Link={Link}>
        {() => <AuthLink href="/login/sign-in">Sign in</AuthLink>}
      </AuthProvider>
    ))

    expect(receivedHref).toBe("/login/sign-in")
  })
})
