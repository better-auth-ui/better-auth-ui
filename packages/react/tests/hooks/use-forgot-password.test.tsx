import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useForgotPassword } from "../../src/hooks/auth/use-forgot-password"

const mockRequestPasswordReset = vi.fn()
const mockUseSession = vi.fn(() => ({
  data: null,
  isPending: false,
  error: null
}))

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    requestPasswordReset: mockRequestPasswordReset,
    useSession: mockUseSession
  }))
}))

describe("useForgotPassword", () => {
  const mockAuthClient = createAuthClient({ baseURL: "http://localhost:3000" })
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
  const mockNavigate = vi.fn()

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider
      authClient={mockAuthClient}
      toast={mockToast}
      navigate={mockNavigate}
    >
      {children}
    </AuthProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("successful password reset request", () => {
    it("should request password reset with email", async () => {
      mockRequestPasswordReset.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")

      await action(formData)

      await waitFor(() => {
        expect(mockRequestPasswordReset).toHaveBeenCalledWith({
          email: "test@example.com",
          redirectTo: "/auth/reset-password"
        })
      })

      expect(mockToast.success).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith("/auth/sign-in")
    })

    it("should use custom basePaths", async () => {
      mockRequestPasswordReset.mockResolvedValue({ data: {}, error: null })

      const wrapperWithCustomPaths = ({
        children
      }: {
        children: ReactNode
      }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          navigate={mockNavigate}
          basePaths={{
            auth: "/custom-auth",
            settings: "/settings",
            organization: "/org"
          }}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useForgotPassword(), {
        wrapper: wrapperWithCustomPaths
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")

      await action(formData)

      await waitFor(() => {
        expect(mockRequestPasswordReset).toHaveBeenCalledWith({
          email: "test@example.com",
          redirectTo: "/custom-auth/reset-password"
        })
        expect(mockNavigate).toHaveBeenCalledWith("/custom-auth/sign-in")
      })
    })
  })

  describe("error handling", () => {
    it("should handle request password reset error", async () => {
      mockRequestPasswordReset.mockResolvedValue({
        data: null,
        error: {
          message: "User not found",
          statusText: "User not found"
        }
      })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "nonexistent@example.com")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("User not found")
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("should handle network errors", async () => {
      mockRequestPasswordReset.mockResolvedValue({
        data: null,
        error: {
          message: "Network error",
          statusText: "Network error"
        }
      })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Network error")
      })
    })
  })

  describe("form state management", () => {
    it("should initialize with empty email", () => {
      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [state] = result.current

      expect(state.email).toBe("")
    })

    it("should return email in state after submission", async () => {
      mockRequestPasswordReset.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")

      const newState = await action(formData)

      expect(newState.email).toBe("test@example.com")
    })
  })

  describe("edge cases", () => {
    it("should handle missing email in formData", async () => {
      mockRequestPasswordReset.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()

      await action(formData)

      await waitFor(() => {
        expect(mockRequestPasswordReset).toHaveBeenCalledWith({
          email: null,
          redirectTo: "/auth/reset-password"
        })
      })
    })

    it("should handle empty email string", async () => {
      mockRequestPasswordReset.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "")

      const newState = await action(formData)

      expect(newState.email).toBe("")
    })
  })
})
