import { authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Auth } from "../src/components/auth/auth"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { OrganizationSsoProviders } from "../src/components/auth/sso/organization-sso-providers"
import { SsoDomainVerification } from "../src/components/auth/sso/sso-domain-verification"
import { SsoProviderSetup } from "../src/components/auth/sso/sso-provider-setup"
import { organizationPlugin } from "../src/lib/auth/organization-plugin"
import { passkeyPlugin } from "../src/lib/auth/passkey-plugin"
import { ssoPlugin } from "../src/lib/auth/sso-plugin"

function createMockAuthClient({
  hasProvider = false,
  memberRole
}: {
  hasProvider?: boolean
  memberRole?: string
} = {}) {
  const sso = vi.fn<
    () => Promise<{ data: { url: string; redirect: boolean }; error: null }>
  >(() => {
    if (!hasProvider) {
      return Promise.reject(
        Object.assign(new Error("No provider found"), { status: 404 })
      )
    }

    return Promise.resolve({
      data: { url: "https://idp.example.com/authorize", redirect: true },
      error: null
    })
  })
  const email = vi.fn<
    () => Promise<{ data: { user: { id: string } }; error: null }>
  >(() =>
    Promise.resolve({
      data: { user: { id: "user-1" } },
      error: null
    })
  )
  const passkey = vi.fn<
    () => Promise<{ data: Record<string, never>; error: null }>
  >(() =>
    Promise.resolve({
      data: {},
      error: null
    })
  )
  const register = vi.fn<
    (provider: Record<string, unknown>) => Promise<Record<string, unknown>>
  >((provider) => Promise.resolve(provider))
  const requestDomainVerification = vi.fn<
    () => Promise<{ domainVerificationToken: string }>
  >(() =>
    Promise.resolve({
      domainVerificationToken: "renewed-token"
    })
  )
  const verifyDomain = vi.fn<() => Promise<undefined>>(() =>
    Promise.resolve(undefined)
  )
  const getActiveMemberRole = vi.fn<
    () => Promise<{ role: string | undefined }>
  >(() => Promise.resolve({ role: memberRole }))
  const session = memberRole
    ? {
        session: { id: "session-1" },
        user: { id: "user-1", email: "person@example.com", name: "Person" }
      }
    : null

  return {
    signIn: { email, passkey, sso },
    sso: { register, requestDomainVerification, verifyDomain },
    organization: { getActiveMemberRole },
    useSession: () => ({ data: session, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    signIn: { email: typeof email; passkey: typeof passkey; sso: typeof sso }
    sso: {
      register: typeof register
      requestDomainVerification: typeof requestDomainVerification
      verifyDomain: typeof verifyDomain
    }
  }
}

function renderSso(authClient = createMockAuthClient()) {
  return {
    authClient,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={vi.fn<(...args: unknown[]) => void>()}
        plugins={[ssoPlugin()]}
      >
        <Auth view="signIn" />
      </AuthProvider>
    )
  }
}

beforeEach(() => {
  sessionStorage.clear()
})

describe("<EmailFirstSignIn />", () => {
  it("discovers SSO from the submitted email", async () => {
    const user = userEvent.setup()
    const { authClient } = renderSso(
      createMockAuthClient({ hasProvider: true })
    )

    await user.type(screen.getByLabelText(/email/iu), "person@example.com")
    await user.click(
      screen.getByRole("button", { name: /continue with email/iu })
    )

    await waitFor(() => {
      expect(authClient.signIn.sso).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "person@example.com",
          loginHint: "person@example.com",
          fetchOptions: expect.objectContaining({ throw: true })
        })
      )
    })
  })

  it("falls back to password without asking for the email again", async () => {
    const user = userEvent.setup()
    const { authClient } = renderSso()

    await user.type(screen.getByLabelText(/email/iu), "person@example.com")
    await user.click(
      screen.getByRole("button", { name: /continue with email/iu })
    )

    expect(await screen.findByText("person@example.com")).toBeInTheDocument()
    await user.type(
      screen.getByLabelText(/^password$/iu),
      "correct horse battery staple"
    )
    await user.click(screen.getByRole("button", { name: /^sign in$/iu }))

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "person@example.com",
          password: "correct horse battery staple",
          fetchOptions: expect.objectContaining({ throw: true })
        })
      )
    })
  })

  it("keeps social sign-in available after discovery falls back", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient()

    render(
      <AuthProvider
        authClient={authClient}
        navigate={vi.fn<(...args: unknown[]) => void>()}
        plugins={[ssoPlugin()]}
        socialProviders={["github"]}
      >
        <Auth view="signIn" />
      </AuthProvider>
    )

    await user.type(screen.getByLabelText(/email/iu), "person@example.com")
    await user.click(
      screen.getByRole("button", { name: /continue with email/iu })
    )

    expect(
      await screen.findByRole("button", { name: /continue with github/iu })
    ).toBeInTheDocument()
  })

  it("keeps one passkey autofill owner after discovery falls back", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient()

    render(
      <AuthProvider
        authClient={authClient}
        navigate={vi.fn<(...args: unknown[]) => void>()}
        plugins={[ssoPlugin(), passkeyPlugin()]}
      >
        <Auth view="signIn" />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(authClient.signIn.passkey).toHaveBeenCalledOnce()
    })

    await user.type(screen.getByLabelText(/email/iu), "person@example.com")
    await user.click(
      screen.getByRole("button", { name: /continue with email/iu })
    )
    await screen.findByText("person@example.com")

    expect(authClient.signIn.passkey).toHaveBeenCalledOnce()
  })
})

describe("SSO provider management", () => {
  it("registers an organization settings tab with explicit scope", () => {
    const plugin = ssoPlugin({ path: "identity", organization: true })

    expect(plugin.organizationTabs?.[0]).toMatchObject({
      id: "sso",
      path: "identity",
      component: OrganizationSsoProviders
    })
    expect(ssoPlugin({ organization: false }).organizationTabs).toBeUndefined()
  })

  it("shows access denied without waiting for the disabled providers query", async () => {
    const authClient = createMockAuthClient({ memberRole: "member" })
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
        mutations: { retry: false }
      }
    })
    queryClient.setQueryData(authQueryKeys.session, {
      session: { id: "session-1" },
      user: { id: "user-1", email: "person@example.com", name: "Person" }
    })

    const { container } = render(
      <AuthProvider
        authClient={authClient}
        navigate={vi.fn<(...args: unknown[]) => void>()}
        plugins={[organizationPlugin(), ssoPlugin({ emailFirst: false })]}
        queryClient={queryClient}
      >
        <OrganizationSsoProviders
          organizationId="org-1"
          organizationSlug="acme"
        />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(container.querySelector("[data-access-denied]")).toBeVisible()
    })
  })

  it("registers an OIDC provider from the setup form", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient()

    render(
      <AuthProvider
        authClient={authClient}
        navigate={vi.fn<(...args: unknown[]) => void>()}
        plugins={[ssoPlugin({ emailFirst: false })]}
      >
        <SsoProviderSetup />
      </AuthProvider>
    )

    await user.type(screen.getByLabelText(/provider id/iu), "acme")
    await user.type(screen.getByLabelText(/email domain/iu), "example.com")
    await user.type(
      screen.getByLabelText(/issuer url/iu),
      "https://idp.example.com"
    )
    await user.type(screen.getByLabelText(/client id/iu), "client-id")
    await user.type(screen.getByLabelText(/client secret/iu), "client-secret")
    await user.click(screen.getByRole("button", { name: /add sso provider/iu }))

    await waitFor(() => {
      expect(authClient.sso.register).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId: "acme",
          issuer: "https://idp.example.com",
          domain: "example.com",
          oidcConfig: {
            clientId: "client-id",
            clientSecret: "client-secret"
          },
          fetchOptions: expect.objectContaining({ throw: true })
        })
      )
    })
  })

  it("blocks whitespace-only values and invalid provider URLs", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient()

    render(
      <AuthProvider
        authClient={authClient}
        navigate={vi.fn<(...args: unknown[]) => void>()}
        plugins={[ssoPlugin({ emailFirst: false })]}
      >
        <SsoProviderSetup />
      </AuthProvider>
    )

    await user.type(screen.getByLabelText(/provider id/iu), "   ")
    await user.type(screen.getByLabelText(/email domain/iu), "   ")
    await user.type(screen.getByLabelText(/issuer url/iu), "idp.example.com")
    await user.tab()

    expect(
      await screen.findByText("Enter a valid absolute URL.")
    ).toBeInTheDocument()
    expect(screen.getAllByText("This field is required")).toHaveLength(2)
    expect(
      screen.getByRole("button", { name: /add sso provider/iu })
    ).toBeEnabled()
    expect(authClient.sso.register).not.toHaveBeenCalled()
  })

  it("registers a trimmed SAML provider from the protocol fields", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient()

    render(
      <AuthProvider
        authClient={authClient}
        navigate={vi.fn<(...args: unknown[]) => void>()}
        plugins={[ssoPlugin({ emailFirst: false })]}
      >
        <SsoProviderSetup defaultOrganizationId="org-1" />
      </AuthProvider>
    )

    await user.type(screen.getByLabelText(/provider id/iu), "  acme-saml  ")
    await user.type(screen.getByLabelText(/email domain/iu), "  example.com  ")
    await user.type(
      screen.getByLabelText(/issuer url/iu),
      "https://idp.example.com"
    )
    await user.click(screen.getByRole("tab", { name: /saml/iu }))
    await user.type(
      await screen.findByLabelText(/sso url/iu),
      "https://idp.example.com/saml"
    )
    await user.type(
      await screen.findByLabelText(/identity provider metadata/iu),
      "  <EntityDescriptor />  "
    )
    await user.click(screen.getByRole("button", { name: /add sso provider/iu }))

    await waitFor(() => {
      expect(authClient.sso.register).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId: "acme-saml",
          issuer: "https://idp.example.com",
          domain: "example.com",
          organizationId: "org-1",
          samlConfig: {
            entryPoint: "https://idp.example.com/saml",
            idpMetadata: { metadata: "<EntityDescriptor />" }
          },
          fetchOptions: expect.objectContaining({ throw: true })
        })
      )
    })
  })

  it("renews a DNS token and verifies the provider domain", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient()

    render(
      <AuthProvider
        authClient={authClient}
        navigate={vi.fn<(...args: unknown[]) => void>()}
        plugins={[ssoPlugin({ emailFirst: false })]}
      >
        <SsoDomainVerification defaultProviderId="acme" />
      </AuthProvider>
    )

    await user.click(screen.getByRole("button", { name: /create new token/iu }))
    expect(await screen.findByDisplayValue("renewed-token")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /verify domain/iu }))

    await waitFor(() => {
      expect(authClient.sso.verifyDomain).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId: "acme",
          fetchOptions: expect.objectContaining({ throw: true })
        })
      )
    })
  })
})

it("preserves an absolute destination while discovering an SSO provider", async () => {
  const user = userEvent.setup()
  const authClient = createMockAuthClient({ hasProvider: true })
  const redirectTo = "https://app.example.com/projects/acme"
  render(
    <AuthProvider
      authClient={authClient}
      navigate={vi.fn<(...args: unknown[]) => void>()}
      baseURL="https://app.example.com/"
      redirectTo={redirectTo}
      plugins={[ssoPlugin()]}
    >
      <Auth view="signIn" />
    </AuthProvider>
  )
  await user.type(screen.getByLabelText(/email/iu), "person@example.com")
  await user.click(
    screen.getByRole("button", { name: /continue with email/iu })
  )
  await waitFor(() => {
    expect(authClient.signIn.sso).toHaveBeenCalledWith(
      expect.objectContaining({ callbackURL: redirectTo })
    )
  })
})

it("preserves the destination when SSO fallback requires email verification", async () => {
  const user = userEvent.setup()
  const authClient = createMockAuthClient()
  authClient.signIn.email.mockRejectedValueOnce({
    error: { code: "EMAIL_NOT_VERIFIED" }
  })
  const navigate = vi.fn<(...args: unknown[]) => void>()
  render(
    <AuthProvider
      authClient={authClient}
      navigate={navigate}
      redirectTo="/invitation?token=abc"
      plugins={[ssoPlugin()]}
    >
      <Auth view="signIn" />
    </AuthProvider>
  )
  await user.type(screen.getByLabelText(/email/iu), "person@example.com")
  await user.click(
    screen.getByRole("button", { name: /continue with email/iu })
  )
  await user.type(await screen.findByLabelText(/^password$/iu), "password123")
  await user.click(screen.getByRole("button", { name: /^sign in$/iu }))
  await waitFor(() => {
    expect(navigate).toHaveBeenCalledWith({
      to: "/auth/verify-email?redirectTo=%2Finvitation%3Ftoken%3Dabc"
    })
  })
})
