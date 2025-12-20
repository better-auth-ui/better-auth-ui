import { renderHook, waitFor } from "@testing-library/react"
import { act } from "react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useForgotPassword } from "../../src/hooks/auth/use-forgot-password"

// Mock better-auth
vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null
    })),
    requestPasswordReset: vi.fn()
  }))
}))

describe("useForgotPassword", () => {
  const mockNavigate = vi.fn()
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
  const mockRequestPasswordReset = vi.fn()

  const mockAuthClient = createAuthClient({
    baseURL: "http://localhost:3000"
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthClient.requestPasswordReset = mockRequestPasswordReset
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider
      authClient={mockAuthClient}
      navigate={mockNavigate}
      toast={mockToast}
    >
      {children}
    </AuthProvider>
  )

  describe("successful password reset request", () => {
    it("should call requestPasswordReset with email and redirectTo", async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [state, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: "test@example.com",
        redirectTo: "/auth/reset-password"
      })
    })

    it("should show success toast on successful request", async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "Password reset email sent"
        )
      })
    })

    it("should navigate to sign-in page on success", async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth/sign-in")
      })
    })

    it("should return email in state", async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      await waitFor(() => {
        expect(result.current[0].email).toBe("test@example.com")
      })
    })
  })

  describe("failed password reset request", () => {
    it("should show error toast when request fails", async () => {
      const error = {
        message: "User not found",
        statusText: "Not Found"
      }
      mockRequestPasswordReset.mockResolvedValue({ error })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "nonexistent@example.com")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      expect(mockToast.error).toHaveBeenCalledWith("User not found")
    })

    it("should use statusText when message is not available", async () => {
      const error = { message: "", statusText: "Bad Request" }
      mockRequestPasswordReset.mockResolvedValue({ error })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      expect(mockToast.error).toHaveBeenCalledWith("Bad Request")
    })

    it("should not navigate on error", async () => {
      const error = { message: "Error", statusText: "Error" }
      mockRequestPasswordReset.mockResolvedValue({ error })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("should not show success toast on error", async () => {
      const error = { message: "Error", statusText: "Error" }
      mockRequestPasswordReset.mockResolvedValue({ error })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      expect(mockToast.success).not.toHaveBeenCalled()
    })
  })

  describe("custom configuration", () => {
    it("should use custom basePath for redirectTo", async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null })

      const { result } = renderHook(
        () =>
          useForgotPassword({
            basePaths: { auth: "/custom-auth", settings: "", organization: "" }
          }),
        { wrapper }
      )
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: "test@example.com",
        redirectTo: "/custom-auth/reset-password"
      })
    })

    it("should use custom viewPath for redirectTo", async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null })

      const { result } = renderHook(
        () =>
          useForgotPassword({
            viewPaths: {
              auth: {
                signIn: "",
                signUp: "",
                signOut: "",
                magicLink: "",
                forgotPassword: "",
                resetPassword: "custom-reset"
              },
              settings: { account: "", security: "" }
            }
          }),
        { wrapper }
      )
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: "test@example.com",
        redirectTo: "/auth/custom-reset"
      })
    })
  })

  describe("initial state", () => {
    it("should initialize with empty email", () => {
      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [state] = result.current

      expect(state.email).toBe("")
    })
  })

  describe("form data validation", () => {
    it("should handle missing email", async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: null,
        redirectTo: "/auth/reset-password"
      })
    })

    it("should handle empty string email", async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useForgotPassword(), { wrapper })
      const [, forgotPasswordAction] = result.current

      const formData = new FormData()
      formData.set("email", "")

      await act(async () => {
        await forgotPasswordAction(formData)
      })

      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: "",
        redirectTo: "/auth/reset-password"
      })
    })
  })
})