import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useSignOut } from "../../src/hooks/auth/use-sign-out"

// Mock better-auth
const mockSignOut = vi.fn()
const mockRefetch = vi.fn()
const mockUseSession = vi.fn(() => ({
  data: { user: { id: "1", email: "test@example.com" } },
  isPending: false,
  error: null,
  refetch: mockRefetch
}))

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    signOut: mockSignOut,
    useSession: mockUseSession
  }))
}))

describe("useSignOut", () => {
  const mockAuthClient = createAuthClient({
    baseURL: "http://localhost:3000"
  })

  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }

  const mockReplace = vi.fn()

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider
      authClient={mockAuthClient}
      toast={mockToast}
      replace={mockReplace}
    >
      {children}
    </AuthProvider>
  )

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("signOut function", () => {
    it("should return signOut function", () => {
      const { result } = renderHook(() => useSignOut(), { wrapper })

      expect(result.current).toHaveProperty("signOut")
      expect(typeof result.current.signOut).toBe("function")
    })

    it("should call authClient.signOut when signOut is invoked", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      expect(mockSignOut).toHaveBeenCalledWith({
        fetchOptions: { disableSignal: true }
      })
    })

    it("should refetch session after sign out", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled()
      })
    })

    it("should navigate to sign-in page after sign out", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/auth/sign-in")
      })
    })

    it("should show error toast when sign out fails", async () => {
      const errorMessage = "Sign out failed"
      mockSignOut.mockResolvedValue({
        error: { message: errorMessage, statusText: "Error" }
      })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(errorMessage)
      })
    })

    it("should still refetch and navigate even when sign out fails", async () => {
      mockSignOut.mockResolvedValue({
        error: { message: "Error", statusText: "Error" }
      })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled()
        expect(mockReplace).toHaveBeenCalled()
      })
    })

    it("should use error statusText when message not available", async () => {
      const statusText = "Internal Server Error"
      mockSignOut.mockResolvedValue({
        error: { statusText }
      })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(statusText)
      })
    })
  })

  describe("custom configuration", () => {
    it("should use custom basePaths from config", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          replace={mockReplace}
          basePaths={{
            auth: "/custom-auth",
            settings: "/settings",
            organization: "/org"
          }}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useSignOut(), {
        wrapper: customWrapper
      })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/custom-auth/sign-in")
      })
    })

    it("should use custom viewPaths from config", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          replace={mockReplace}
          viewPaths={{
            auth: {
              signIn: "login",
              signUp: "register",
              resetPassword: "reset",
              magicLink: "magic"
            },
            settings: { account: "account" }
          }}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useSignOut(), {
        wrapper: customWrapper
      })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/auth/login")
      })
    })

    it("should accept config parameter to override context", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const customBasePaths = {
        auth: "/api/auth",
        settings: "/settings",
        organization: "/org"
      }

      const { result } = renderHook(
        () => useSignOut({ basePaths: customBasePaths }),
        { wrapper }
      )

      await result.current.signOut()

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/api/auth/sign-in")
      })
    })
  })

  describe("callback stability", () => {
    it("should maintain stable reference across re-renders", () => {
      const { result, rerender } = renderHook(() => useSignOut(), { wrapper })

      const firstSignOut = result.current.signOut
      rerender()
      const secondSignOut = result.current.signOut

      expect(firstSignOut).toBe(secondSignOut)
    })
  })
})
