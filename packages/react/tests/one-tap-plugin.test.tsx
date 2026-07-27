import { QueryClient } from "@tanstack/react-query"
import { render, waitFor } from "@testing-library/react"
import { StrictMode } from "react"
import { describe, expect, it, vi } from "vitest"
import { AuthPrompts, AuthProvider } from "../src"
import { oneTapPlugin } from "../src/plugins"

type OneTapParams = {
  context?: "signin" | "signup" | "use"
  fetchOptions?: {
    onSuccess?: (context: { data: unknown }) => void | Promise<void>
    throw?: boolean
  }
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false }
    }
  })
}

function createAuthClient(oneTap: (params: OneTapParams) => Promise<void>) {
  return { oneTap } as never
}

describe("oneTapPlugin (React)", () => {
  it("opens once on sign-in without joining the shared sign-in pending state", async () => {
    const oneTap = vi.fn(async () => {})

    render(
      <StrictMode>
        <AuthProvider
          authClient={createAuthClient(oneTap)}
          navigate={() => {}}
          plugins={[oneTapPlugin({ autoSelect: true })]}
          queryClient={createQueryClient()}
        >
          <AuthPrompts view="signIn" />
        </AuthProvider>
      </StrictMode>
    )

    await waitFor(() => expect(oneTap).toHaveBeenCalledOnce())
    expect(oneTap).toHaveBeenCalledWith({
      autoSelect: true,
      context: "signin",
      fetchOptions: {
        onSuccess: expect.any(Function),
        throw: true
      }
    })
  })

  it("does not open on sign-up unless that view is enabled", async () => {
    const oneTap = vi.fn(async () => {})
    const { rerender } = render(
      <AuthProvider
        authClient={createAuthClient(oneTap)}
        navigate={() => {}}
        plugins={[oneTapPlugin()]}
        queryClient={createQueryClient()}
      >
        <AuthPrompts view="signUp" />
      </AuthProvider>
    )

    await Promise.resolve()
    expect(oneTap).not.toHaveBeenCalled()

    rerender(
      <AuthProvider
        authClient={createAuthClient(oneTap)}
        navigate={() => {}}
        plugins={[oneTapPlugin({ views: ["signUp"] })]}
        queryClient={createQueryClient()}
      >
        <AuthPrompts view="signUp" />
      </AuthProvider>
    )

    await waitFor(() => expect(oneTap).toHaveBeenCalledOnce())
    expect(oneTap).toHaveBeenCalledWith(
      expect.objectContaining({ context: "signup" })
    )
  })

  it("refreshes the session and navigates only after authentication succeeds", async () => {
    const navigate = vi.fn()
    const queryClient = createQueryClient()
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries")
    const oneTap = vi.fn(async (params: OneTapParams) => {
      await params.fetchOptions?.onSuccess?.({
        data: { user: { id: "user-1" } }
      })
    })

    render(
      <AuthProvider
        authClient={createAuthClient(oneTap)}
        navigate={navigate}
        plugins={[oneTapPlugin()]}
        queryClient={queryClient}
        redirectTo="/dashboard"
      >
        <AuthPrompts view="signIn" />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith(
        { queryKey: ["auth", "getSession"] },
        { cancelRefetch: false }
      )
      expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" })
    })
  })

  it("continues to the registered two-factor challenge without refreshing a session", async () => {
    const navigate = vi.fn()
    const queryClient = createQueryClient()
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries")
    const oneTap = vi.fn(async (params: OneTapParams) => {
      await params.fetchOptions?.onSuccess?.({
        data: { twoFactorRedirect: true, twoFactorMethods: ["totp"] }
      })
    })

    render(
      <AuthProvider
        authClient={createAuthClient(oneTap)}
        navigate={navigate}
        plugins={[
          oneTapPlugin(),
          {
            id: "twoFactor",
            viewPaths: { auth: { twoFactor: "two-factor" } }
          }
        ]}
        queryClient={queryClient}
        redirectTo="/dashboard"
      >
        <AuthPrompts view="signIn" />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: "/auth/two-factor?redirectTo=%2Fdashboard"
      })
    })
    expect(invalidateQueries).not.toHaveBeenCalled()
    expect(sessionStorage.getItem("better-auth-ui.two-factor-methods")).toBe(
      '["totp"]'
    )
  })
})
