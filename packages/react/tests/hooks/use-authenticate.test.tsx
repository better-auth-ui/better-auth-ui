import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useAuthenticate } from "../../src/hooks/auth/use-authenticate"

// Mock better-auth
vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null
    }))
  }))
}))

describe("useAuthenticate", () => {
  const mockReplace = vi.fn()
  const mockAuthClient = createAuthClient({
    baseURL: "http://localhost:3000"
  })

  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, "", "/")
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("authenticated user", () => {
    it("should return session data when user is authenticated", () => {
      const mockSession = {
        user: { id: "123", email: "test@example.com", name: "Test User" },
        session: { id: "session-123", token: "token-123" }
      }

      const mockAuthClientWithSession = {
        ...mockAuthClient,
        useSession: vi.fn(() => ({
          data: mockSession,
          isPending: false,
          error: null
        }))
      }

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClientWithSession}
          replace={mockReplace}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuthenticate(), { wrapper })

      expect(result.current.data).toEqual(mockSession)
      expect(result.current.isPending).toBe(false)
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it("should not redirect when data is present", () => {
      const mockAuthClientWithSession = {
        ...mockAuthClient,
        useSession: vi.fn(() => ({
          data: { user: { id: "123" }, session: { id: "session-123" } },
          isPending: false,
          error: null
        }))
      }

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClientWithSession}
          replace={mockReplace}
        >
          {children}
        </AuthProvider>
      )

      renderHook(() => useAuthenticate(), { wrapper })

      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  describe("unauthenticated user", () => {
    it("should redirect to sign-in when user is not authenticated", async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} replace={mockReplace}>
          {children}
        </AuthProvider>
      )

      renderHook(() => useAuthenticate(), { wrapper })

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/auth/sign-in?redirectTo=%2F"
        )
      })
    })

    it("should preserve current URL in redirectTo", async () => {
      window.history.pushState({}, "", "/dashboard/settings")

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} replace={mockReplace}>
          {children}
        </AuthProvider>
      )

      renderHook(() => useAuthenticate(), { wrapper })

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/auth/sign-in?redirectTo=%2Fdashboard%2Fsettings"
        )
      })
    })

    it("should preserve query parameters in redirectTo", async () => {
      window.history.pushState({}, "", "/dashboard?tab=profile&view=grid")

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} replace={mockReplace}>
          {children}
        </AuthProvider>
      )

      renderHook(() => useAuthenticate(), { wrapper })

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/auth/sign-in?redirectTo=%2Fdashboard%3Ftab%3Dprofile%26view%3Dgrid"
        )
      })
    })
  })

  describe("loading state", () => {
    it("should not redirect while session is loading", () => {
      const mockAuthClientLoading = {
        ...mockAuthClient,
        useSession: vi.fn(() => ({
          data: null,
          isPending: true,
          error: null
        }))
      }

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClientLoading} replace={mockReplace}>
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuthenticate(), { wrapper })

      expect(result.current.isPending).toBe(true)
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it("should return isPending true when loading", () => {
      const mockAuthClientLoading = {
        ...mockAuthClient,
        useSession: vi.fn(() => ({
          data: null,
          isPending: true,
          error: null
        }))
      }

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClientLoading} replace={mockReplace}>
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuthenticate(), { wrapper })

      expect(result.current.isPending).toBe(true)
      expect(result.current.data).toBeNull()
    })
  })

  describe("custom configuration", () => {
    it("should use custom basePath", async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} replace={mockReplace}>
          {children}
        </AuthProvider>
      )

      renderHook(
        () =>
          useAuthenticate({
            basePaths: { auth: "/custom-auth", settings: "", organization: "" }
          }),
        { wrapper }
      )

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/custom-auth/sign-in?redirectTo=%2F"
        )
      })
    })

    it("should use custom viewPath", async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} replace={mockReplace}>
          {children}
        </AuthProvider>
      )

      renderHook(
        () =>
          useAuthenticate({
            viewPaths: {
              auth: {
                signIn: "login",
                signUp: "",
                signOut: "",
                magicLink: "",
                forgotPassword: "",
                resetPassword: ""
              },
              settings: { account: "", security: "" }
            }
          }),
        { wrapper }
      )

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/auth/login?redirectTo=%2F")
      })
    })
  })

  describe("return value", () => {
    it("should return all session hook properties", () => {
      const mockSession = {
        data: { user: { id: "123" }, session: { id: "session-123" } },
        isPending: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false
      }

      const mockAuthClientWithSession = {
        ...mockAuthClient,
        useSession: vi.fn(() => mockSession)
      }

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClientWithSession}
          replace={mockReplace}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuthenticate(), { wrapper })

      expect(result.current.data).toEqual(mockSession.data)
      expect(result.current.isPending).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })
})