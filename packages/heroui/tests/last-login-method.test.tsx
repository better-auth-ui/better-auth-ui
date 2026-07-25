import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { ProviderButton } from "../src/components/auth/provider-button"
import { SignIn } from "../src/components/auth/sign-in"
import { lastLoginMethodPlugin } from "../src/lib/auth/last-login-method-plugin"

function createMockAuthClient(method: string | null) {
  return {
    getLastUsedLoginMethod: vi.fn(() => method),
    signIn: {
      email: vi.fn(),
      social: vi.fn()
    },
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
}

function renderSignIn(method: string | null) {
  return render(
    <AuthProvider
      authClient={createMockAuthClient(method)}
      navigate={() => {}}
      plugins={[lastLoginMethodPlugin()]}
      socialProviders={["github"]}
    >
      <SignIn />
    </AuthProvider>
  )
}

describe("lastLoginMethodPlugin", () => {
  it("associates the indicator with the last used social provider", () => {
    renderSignIn("github")

    const socialButton = screen.getByRole("button", {
      name: /continue with github/i
    })
    const emailButton = screen.getByRole("button", { name: /^sign in$/i })

    const indicator = within(socialButton).getByText("Last")

    expect(indicator).toBeVisible()
    expect(indicator.closest(".chip")).toHaveClass(
      "top-0",
      "right-0",
      "translate-x-1/4",
      "-translate-y-1/2"
    )
    expect(within(emailButton).queryByText("Last")).toBeNull()
  })

  it("associates the indicator with email credentials", () => {
    renderSignIn("email")

    const socialButton = screen.getByRole("button", {
      name: /continue with github/i
    })
    const emailButton = screen.getByRole("button", { name: /sign in/i })

    expect(within(emailButton).getByText("Last")).toBeVisible()
    expect(within(socialButton).queryByText("Last")).toBeNull()
  })

  it("does not mark social providers in the sign-up view", () => {
    render(
      <AuthProvider
        authClient={createMockAuthClient("github")}
        navigate={() => {}}
        plugins={[lastLoginMethodPlugin()]}
      >
        <ProviderButton provider="github" view="signUp" />
      </AuthProvider>
    )

    expect(screen.queryByText("Last")).toBeNull()
  })
})
