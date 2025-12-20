import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useSignOut } from "../../src/hooks/auth/use-sign-out"

// Mock better-auth
vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null,
      refetch: vi.fn()
    })),
    signOut: vi.fn()
  }))
}))

describe("useSignOut", () => {
  const mockReplace = vi.fn()
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
  const mockRefetch = vi.fn()
  const mockSignOut = vi.fn()

  const mockAuthClient = createAuthClient({
    baseURL: "http://localhost:3000"
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthClient.useSession = vi.fn(() => ({
      data: null,
      isPending: false,
      error: null,
      refetch: mockRefetch
    }))
    mockAuthClient.signOut = mockSignOut
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider
      authClient={mockAuthClient}
      replace={mockReplace}
      toast={mockToast}
    >
      {children}
    </AuthProvider>
  )

  describe("successful sign out", () => {
    it("should call signOut with correct options", async () => {
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

      expect(mockRefetch).toHaveBeenCalled()
    })

    it("should redirect to sign-in page after sign out", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/auth/sign-in")
      })
    })

    it("should not show error toast on success", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      expect(mockToast.error).not.toHaveBeenCalled()
    })
  })

  describe("failed sign out", () => {
    it("should show error toast when signOut fails", async () => {
      const error = { message: "Sign out failed", statusText: "Error" }
      mockSignOut.mockResolvedValue({ error })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      expect(mockToast.error).toHaveBeenCalledWith("Sign out failed")
    })

    it("should use statusText when message is not available", async () => {
      const error = { message: "", statusText: "Internal Server Error" }
      mockSignOut.mockResolvedValue({ error })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      expect(mockToast.error).toHaveBeenCalledWith("Internal Server Error")
    })

    it("should still refetch session after error", async () => {
      const error = { message: "Error", statusText: "Error" }
      mockSignOut.mockResolvedValue({ error })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      expect(mockRefetch).toHaveBeenCalled()
    })

    it("should still redirect after error", async () => {
      const error = { message: "Error", statusText: "Error" }
      mockSignOut.mockResolvedValue({ error })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.signOut()

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/auth/sign-in")
      })
    })
  })

  describe("custom configuration", () => {
    it("should use custom basePath", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(
        () =>
          useSignOut({
            basePaths: { auth: "/custom-auth", settings: "", organization: "" }
          }),
        { wrapper }
      )

      await result.current.signOut()

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/custom-auth/sign-in")
      })
    })

    it("should use custom viewPath", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(
        () =>
          useSignOut({
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

      await result.current.signOut()

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/auth/login")
      })
    })
  })

  describe("callback stability", () => {
    it("should return stable signOut callback", () => {
      const { result, rerender } = renderHook(() => useSignOut(), { wrapper })

      const firstCallback = result.current.signOut
      rerender()
      const secondCallback = result.current.signOut

      expect(firstCallback).toBe(secondCallback)
    })
  })
})
