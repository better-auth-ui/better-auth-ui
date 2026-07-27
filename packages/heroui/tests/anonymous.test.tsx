import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AnonymousButton } from "../src/components/auth/anonymous/anonymous-button"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { anonymousPlugin } from "../src/lib/auth/anonymous-plugin"

function createAuthClient() {
  const anonymous = vi.fn(async () => ({ user: { id: "guest-1" } }))

  return {
    signIn: { anonymous },
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    signIn: { anonymous: typeof anonymous }
  }
}

function renderAnonymousButton(
  options: Parameters<typeof anonymousPlugin>[0] = {}
) {
  const authClient = createAuthClient()
  const navigate = vi.fn()

  return {
    authClient,
    navigate,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        plugins={[anonymousPlugin(options)]}
        queryClient={
          new QueryClient({
            defaultOptions: {
              mutations: { retry: false },
              queries: { retry: false }
            }
          })
        }
        redirectTo="/dashboard"
      >
        <AnonymousButton />
      </AuthProvider>
    )
  }
}

describe("<AnonymousButton />", () => {
  it("signs in as a guest and follows the configured redirect", async () => {
    const user = userEvent.setup()
    const { authClient, navigate } = renderAnonymousButton()

    await user.click(screen.getByRole("button", { name: /continue as guest/i }))

    await waitFor(() => {
      expect(authClient.signIn.anonymous).toHaveBeenCalledWith({
        fetchOptions: { throw: true }
      })
      expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" })
    })
  })

  it("uses the configured button label", () => {
    renderAnonymousButton({
      localization: { continueAsGuest: "Explore as a guest" }
    })

    expect(
      screen.getByRole("button", { name: "Explore as a guest" })
    ).toBeInTheDocument()
  })
})
