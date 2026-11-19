import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { ProviderButton } from "../src/components/auth/provider-button"
import { SignIn } from "../src/components/auth/sign-in"
import { lastLoginMethodPlugin } from "../src/lib/auth/last-login-method-plugin"

function createMockAuthClient(method: string | null) {
  return {
    getSession: vi.fn<() => Promise<null>>(() => Promise.resolve(null)),
    getLastUsedLoginMethod: vi.fn<() => string | null>(() => method),
    signIn: {
      email: vi.fn<(...args: unknown[]) => unknown>(),
      popup: vi.fn<(...args: unknown[]) => unknown>(),
      social: vi.fn<(...args: unknown[]) => unknown>()
    }
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

  it("signs in with a custom provider ID and renders its metadata", async () => {
    const authClient = createMockAuthClient(null)
    const signInSocial = vi.fn<() => Promise<{ data: {}; error: null }>>(() =>
      Promise.resolve({ data: {}, error: null })
    )
    authClient.signIn.social = signInSocial as never

    render(
      <AuthProvider authClient={authClient} navigate={() => {}}>
        <ProviderButton
          provider={{
            id: "acme-sso",
            label: "Acme ID",
            icon: <svg aria-label="Acme logo" />
          }}
        />
      </AuthProvider>
    )

    fireEvent.click(
      screen.getByRole("button", { name: /continue with acme id/i })
    )

    expect(screen.getByLabelText("Acme logo")).toBeVisible()
    await waitFor(() =>
      expect(signInSocial).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "acme-sso" })
      )
    )
  })

  it("uses popup sign-in when configured", async () => {
    const authClient = createMockAuthClient(null)
    const signInPopup = vi.fn<
      () => Promise<{ data: { success: boolean }; error: null }>
    >(() =>
      Promise.resolve({
        data: { success: true },
        error: null
      })
    )
    Object.assign(authClient.signIn, { popup: signInPopup })
    const navigate = vi.fn<(...args: unknown[]) => unknown>()

    render(
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        redirectTo="/dashboard"
        socialSignInMode="popup"
      >
        <ProviderButton provider="github" />
      </AuthProvider>
    )

    fireEvent.click(
      screen.getByRole("button", { name: /continue with github/i })
    )

    await waitFor(() =>
      expect(signInPopup).toHaveBeenCalledWith({
        provider: "github",
        callbackURL: "/dashboard",
        requestSignUp: false
      })
    )
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" })
    )
  })
})
