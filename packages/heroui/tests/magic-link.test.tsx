import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { MagicLink } from "../src/components/auth/magic-link/magic-link"
import { MagicLinkSent } from "../src/components/auth/magic-link/magic-link-sent"
import { magicLinkPlugin } from "../src/lib/auth/magic-link-plugin"

/**
 * Minimal `authClient` shape required by `<MagicLink>`. We only need
 * `signIn.magicLink` — the only better-auth API the component touches.
 */
function createMockAuthClient(
  impl: (params: {
    email: string
    callbackURL?: string
  }) => Promise<unknown> = async () => ({ data: {}, error: null })
) {
  const magicLink = vi.fn(impl)

  return {
    signIn: { magicLink },
    // Other surfaces the provider type expects but our component never reads.
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    signIn: { magicLink: typeof magicLink }
  }
}

function renderWithProvider(
  children: React.ReactNode,
  authClient = createMockAuthClient()
) {
  const navigate = vi.fn()

  return {
    authClient,
    navigate,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        plugins={[magicLinkPlugin()]}
      >
        {children}
      </AuthProvider>
    )
  }
}

beforeEach(() => {
  sessionStorage.clear()
})

describe("<MagicLink />", () => {
  it("calls authClient.signIn.magicLink with the entered email", async () => {
    const user = userEvent.setup()
    const { authClient } = renderWithProvider(<MagicLink />)

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.click(screen.getByRole("button", { name: /send magic link/i }))

    await waitFor(() => {
      expect(authClient.signIn.magicLink).toHaveBeenCalledTimes(1)
    })

    expect(authClient.signIn.magicLink).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )
  })

  it("stores the email and redirects to the magic-link-sent view on success", async () => {
    const user = userEvent.setup()
    const { navigate } = renderWithProvider(<MagicLink />)

    await user.type(screen.getByLabelText(/email/i), "user@gmail.com")
    await user.click(screen.getByRole("button", { name: /send magic link/i }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ to: "/auth/magic-link-sent" })
    })
    expect(sessionStorage.getItem("better-auth-ui.magic-link-sent")).toBe(
      "user@gmail.com"
    )
  })

  it("keeps the form and entered email when sending fails", async () => {
    const user = userEvent.setup()
    const { authClient, navigate } = renderWithProvider(
      <MagicLink />,
      createMockAuthClient(async () => {
        throw new Error("network down")
      })
    )

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.click(screen.getByRole("button", { name: /send magic link/i }))

    await waitFor(() => {
      expect(authClient.signIn.magicLink).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByLabelText(/email/i)).toHaveValue("user@example.com")
    expect(
      screen.getByRole("button", { name: /send magic link/i })
    ).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
  })
})

describe("<MagicLinkSent />", () => {
  it("offers to open the email provider for the stored email", async () => {
    sessionStorage.setItem("better-auth-ui.magic-link-sent", "user@gmail.com")

    renderWithProvider(<MagicLinkSent />)

    expect(
      await screen.findByRole("link", { name: /open gmail/i })
    ).toHaveAttribute("href", "https://mail.google.com/mail/")
  })

  it("still confirms the send without a provider link for unknown domains", async () => {
    sessionStorage.setItem(
      "better-auth-ui.magic-link-sent",
      "user@internal-corp.dev"
    )

    renderWithProvider(<MagicLinkSent />)

    await waitFor(() => {
      expect(
        screen.queryByRole("link", { name: /open/i })
      ).not.toBeInTheDocument()
    })
  })
})
