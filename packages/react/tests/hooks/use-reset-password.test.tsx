import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useResetPassword } from "../../src/hooks/auth/use-reset-password"

const mockResetPassword = vi.fn()
const mockUseSession = vi.fn(() => ({
  data: null,
  isPending: false,
  error: null
}))

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    resetPassword: mockResetPassword,
    useSession: mockUseSession
  }))
}))

describe("useResetPassword", () => {
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
    // Mock URL with token
    delete (window as any).location
    ;(window as any).location = {
      search: "?token=reset-token-123"
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("successful password reset", () => {
    it("should reset password with token", async () => {
      mockResetPassword.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useResetPassword(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("password", "newPassword123")

      await action(formData)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith({
          token: "reset-token-123",
          newPassword: "newPassword123"
        })
      })

      expect(mockToast.success).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith("/auth/sign-in")
    })

    it("should validate password confirmation when enabled", async () => {
      const wrapperWithConfirm = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          navigate={mockNavigate}
          emailAndPassword={{
            enabled: true,
            forgotPassword: true,
            confirmPassword: true
          }}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: wrapperWithConfirm
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("password", "newPassword123")
      formData.append("confirmPassword", "differentPassword")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled()
        expect(mockResetPassword).not.toHaveBeenCalled()
      })
    })

    it("should allow matching passwords", async () => {
      mockResetPassword.mockResolvedValue({ data: {}, error: null })

      const wrapperWithConfirm = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          navigate={mockNavigate}
          emailAndPassword={{
            enabled: true,
            forgotPassword: true,
            confirmPassword: true
          }}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: wrapperWithConfirm
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("password", "newPassword123")
      formData.append("confirmPassword", "newPassword123")

      await action(formData)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalled()
      })
    })
  })

  describe("missing token handling", () => {
    it("should handle missing token in URL", async () => {
      ;(window as any).location.search = ""

      const { result } = renderHook(() => useResetPassword(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("password", "newPassword123")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith("/auth/sign-in")
        expect(mockResetPassword).not.toHaveBeenCalled()
      })
    })
  })

  describe("error handling", () => {
    it("should handle reset password error", async () => {
      mockResetPassword.mockResolvedValue({
        data: null,
        error: {
          message: "Invalid token",
          statusText: "Invalid token"
        }
      })

      const { result } = renderHook(() => useResetPassword(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("password", "newPassword123")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Invalid token")
      })
    })

    it("should clear passwords on error", async () => {
      mockResetPassword.mockResolvedValue({
        data: null,
        error: {
          message: "Reset failed",
          statusText: "Reset failed"
        }
      })

      const { result } = renderHook(() => useResetPassword(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("password", "newPassword123")
      formData.append("confirmPassword", "newPassword123")

      const newState = await action(formData)

      await waitFor(() => {
        expect(newState.password).toBe("")
        expect(newState.confirmPassword).toBe("")
      })
    })
  })

  describe("form state management", () => {
    it("should initialize with empty state", () => {
      const { result } = renderHook(() => useResetPassword(), { wrapper })
      const [state] = result.current

      expect(state.password).toBe("")
      expect(state.confirmPassword).toBe("")
    })
  })
})
