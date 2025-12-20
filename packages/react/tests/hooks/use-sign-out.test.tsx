import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useSignOut } from "../../src/hooks/auth/use-sign-out"

const mockSignOut = vi.fn()
const mockRefetch = vi.fn()
const mockUseSession = vi.fn(() => ({
  data: { user: { id: "123", email: "test@example.com" } },
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
  const mockAuthClient = createAuthClient({ baseURL: "http://localhost:3000" })
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

  beforeEach(() => {
    vi.clearAllMocks()
    mockRefetch.mockResolvedValue({})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("successful sign out", () => {
    it("should sign out and redirect to sign-in page", async () => {
      mockSignOut.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({
          fetchOptions: { disableSignal: true }
        })
      })

      expect(mockRefetch).toHaveBeenCalled()
      expect(mockReplace).toHaveBeenCalledWith("/auth/sign-in")
    })

    it("should use custom basePaths", async () => {
      mockSignOut.mockResolvedValue({ data: {}, error: null })

      const wrapperWithCustomPaths = ({ children }: { children: ReactNode }) => (
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
        wrapper: wrapperWithCustomPaths
      })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/custom-auth/sign-in")
      })
    })

    it("should return signOut callback", () => {
      const { result } = renderHook(() => useSignOut(), { wrapper })

      expect(typeof result.current.signOut).toBe("function")
    })
  })

  describe("error handling", () => {
    it("should handle sign out error", async () => {
      mockSignOut.mockResolvedValue({
        data: null,
        error: {
          message: "Sign out failed",
          statusText: "Sign out failed"
        }
      })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Sign out failed")
      })
    })

    it("should still refetch and redirect on error", async () => {
      mockSignOut.mockResolvedValue({
        data: null,
        error: {
          message: "Error",
          statusText: "Error"
        }
      })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled()
        expect(mockReplace).toHaveBeenCalledWith("/auth/sign-in")
      })
    })
  })

  describe("callback stability", () => {
    it("should return stable signOut callback", () => {
      const { result, rerender } = renderHook(() => useSignOut(), { wrapper })

      const firstSignOut = result.current.signOut

      rerender()

      const secondSignOut = result.current.signOut

      expect(firstSignOut).toBe(secondSignOut)
    })
  })
})