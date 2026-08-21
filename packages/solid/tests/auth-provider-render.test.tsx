import {
  authQueryKeys,
  basePaths,
  createAuthPlugin,
  deepmerge,
  defineAuthLocale,
  localization,
  resolveAuthConfig
} from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/solid-query"
import { renderToString } from "solid-js/web"
import { describe, expect, it, vi } from "vitest"

import {
  AuthLink,
  type AuthLinkProps,
  AuthProvider,
  useAuth,
  useAuthPlugin
} from "../src"
import { createReactiveAuthConfig } from "../src/lib/reactive-auth-config"

function AuthConsumer() {
  const auth = useAuth()

  return auth.basePaths.auth
}

const testPlugin = createAuthPlugin("test", (label: string) => ({
  localization: { label }
}))

describe("Solid AuthProvider render context", () => {
  it("disables auth query retries during server rendering", () => {
    const authClient = { getSession: vi.fn() }
    const queryClient = new QueryClient()

    renderToString(() => (
      <AuthProvider
        authClient={authClient as never}
        queryClient={queryClient}
      />
    ))

    const defaults = queryClient.getQueryDefaults(authQueryKeys.all)
    const retry = defaults.retry

    expect(typeof retry).toBe("function")
    expect(
      typeof retry === "function" &&
        retry(0, Object.assign(new Error("Rate limited"), { status: 429 }))
    ).toBe(false)

    const retryDelay = defaults.retryDelay

    expect(
      typeof retryDelay === "function" &&
        retryDelay(
          0,
          Object.assign(new Error("Rate limited"), {
            retryAfterMs: 12_000
          })
        )
    ).toBe(12_000)
  })

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

  it("returns the registered plugin configuration from provider context", () => {
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

    expect(resolvedPlugin).toMatchObject(registeredPlugin)
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

  it("keeps destructured locale values current when the config changes", () => {
    const germanLocale = defineAuthLocale({
      languageTag: "de-DE",
      localization: deepmerge(localization, {
        auth: { signIn: "Anmelden" }
      }),
      plugins: { test: { label: "Erweiterung" } }
    })
    const plugin = testPlugin("Plugin")
    let config = resolveAuthConfig({ authClient: {}, plugins: [plugin] })
    const reactiveConfig = createReactiveAuthConfig(() => config)
    const destructuredLocalization = reactiveConfig.localization
    const destructuredLocale = reactiveConfig.locale
    const destructuredPlugin = reactiveConfig.plugins[0]
    const destructuredPluginLocalization = destructuredPlugin?.localization

    expect(destructuredLocalization.auth.signIn).toBe("Sign In")
    expect(destructuredLocale).toBeDefined()
    expect(destructuredPluginLocalization?.label).toBe("Plugin")

    config = resolveAuthConfig({
      authClient: {},
      locale: germanLocale,
      plugins: [plugin]
    })

    expect(destructuredLocalization.auth.signIn).toBe("Anmelden")
    expect(destructuredLocale.languageTag).toBe("de-DE")
    expect(destructuredPluginLocalization?.label).toBe("Erweiterung")
  })
})
