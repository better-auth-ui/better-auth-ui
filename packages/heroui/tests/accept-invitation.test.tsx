import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Auth } from "../src/components/auth/auth"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { AcceptInvitation } from "../src/components/auth/organization/accept-invitation"
import { organizationPlugin } from "../src/lib/auth/organization-plugin"

const session = {
  session: {
    id: "session-1",
    token: "session-token",
    userId: "user-1",
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  user: {
    id: "user-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const invitation = {
  id: "invitation-1",
  organizationId: "organization-1",
  organizationName: "Analytical Engines",
  email: "ada@example.com",
  role: "admin",
  status: "pending",
  expiresAt: new Date(Date.now() + 60_000),
  inviterId: "user-2",
  createdAt: new Date()
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
}

function createMockAuthClient(currentInvitation = invitation) {
  const getSession = vi.fn(async () => session)
  const acceptInvitation = vi.fn(async () => invitation)
  const rejectInvitation = vi.fn(async () => invitation)
  const getInvitation = vi.fn(async ({ query }: { query: { id: string } }) =>
    query.id === currentInvitation?.id ? currentInvitation : null
  )

  return {
    getSession,
    organization: {
      acceptInvitation,
      rejectInvitation,
      getInvitation
    }
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    getSession: typeof getSession
    organization: {
      acceptInvitation: typeof acceptInvitation
      rejectInvitation: typeof rejectInvitation
      getInvitation: typeof getInvitation
    }
  }
}

function renderInvitation(
  authClient = createMockAuthClient(),
  children = <AcceptInvitation />
) {
  const navigate = vi.fn()

  return {
    authClient,
    navigate,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        plugins={[organizationPlugin()]}
        queryClient={createTestQueryClient()}
      >
        {children}
      </AuthProvider>
    )
  }
}

afterEach(() => {
  window.history.pushState({}, "", "/")
})

describe("organizationPlugin invitation view (heroui)", () => {
  it("registers the direct invitation view and custom path", () => {
    const plugin = organizationPlugin({
      viewPaths: { auth: { acceptInvitation: "join" } }
    })

    expect(plugin.views?.auth?.acceptInvitation).toBe(AcceptInvitation)
    expect(plugin.viewPaths.auth.acceptInvitation).toBe("join")
  })

  it("renders through the Auth plugin path dispatcher", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/accept-invitation?invitationId=invitation-1"
    )
    renderInvitation(createMockAuthClient(), <Auth path="accept-invitation" />)

    expect(
      await screen.findByRole("heading", { name: "Organization invitation" })
    ).toBeInTheDocument()
    expect(screen.getByText("Analytical Engines")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toBeInTheDocument()
  })

  it("accepts the invitation and continues to a safe redirect", async () => {
    const user = userEvent.setup()
    window.history.pushState(
      {},
      "",
      "/auth/accept-invitation?invitationId=invitation-1&redirectTo=%2Fdashboard"
    )
    const { authClient, navigate } = renderInvitation()

    await user.click(await screen.findByRole("button", { name: "Accept" }))

    await waitFor(() => {
      expect(authClient.organization.acceptInvitation).toHaveBeenCalledWith({
        invitationId: "invitation-1",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    })
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: "/dashboard",
        replace: true
      })
    })
  })

  it("renders an unavailable state for an unknown invitation", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/accept-invitation?invitationId=missing"
    )
    renderInvitation()

    expect(
      await screen.findByRole("heading", { name: "Invitation unavailable" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Return" })).toBeInTheDocument()
  })

  it("renders an unavailable state for an expired invitation", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/accept-invitation?invitationId=invitation-1"
    )
    renderInvitation(
      createMockAuthClient({
        ...invitation,
        expiresAt: new Date(Date.now() - 60_000)
      })
    )

    expect(
      await screen.findByRole("heading", { name: "Invitation unavailable" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Return" })).toBeInTheDocument()
  })

  it("renders an unavailable state when the invitation id is missing", async () => {
    window.history.pushState({}, "", "/auth/accept-invitation")
    renderInvitation()

    expect(
      await screen.findByRole("heading", { name: "Invitation unavailable" })
    ).toBeInTheDocument()
  })
})
