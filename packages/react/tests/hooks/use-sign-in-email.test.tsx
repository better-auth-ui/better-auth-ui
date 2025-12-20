import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useSignInEmail } from "../../src/hooks/auth/use-sign-in-email"

// Mock better-auth
const mockSignInEmail = vi.fn()
const mockSendVerificationEmail = vi.fn()
const mockRefetch = vi.fn()
const mockUseSession = vi.fn(() => ({
  data: null,
  isPending: false,
  error: null,
  refetch: mockRefetch
}))

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    signIn: {
      email: mockSignInEmail
    },
    sendVerificationEmail: mockSendVerificationEmail,
    useSession: mockUseSession
  }))
}))

describe("useSignInEmail", () => {
  const mockAuthClient = createAuthClient({ baseURL: "http://localhost:3000" })
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn()
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
    mockRefetch.mockResolvedValue({})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("successful sign in", () => {
    it("should sign in with email and password", async () => {
      mockSignInEmail.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInEmail(), { wrapper })
      const [state, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      await action(formData)

      await waitFor(() => {
        expect(mockSignInEmail).toHaveBeenCalledWith(
          {
            email: "test@example.com",
            password: "password123"
          },
          { disableSignal: true }
        )
      })

      expect(mockRefetch).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith("/")
    })

    it("should include rememberMe when configured", async () => {
      mockSignInEmail.mockResolvedValue({ data: {}, error: null })

      const wrapperWithRememberMe = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          navigate={mockNavigate}
          emailAndPassword={{ enabled: true, forgotPassword: true, rememberMe: true }}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useSignInEmail(), {
        wrapper: wrapperWithRememberMe
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")
      formData.append("rememberMe", "on")

      await action(formData)

      await waitFor(() => {
        expect(mockSignInEmail).toHaveBeenCalledWith(
          {
            email: "test@example.com",
            password: "password123",
            rememberMe: true
          },
          { disableSignal: true }
        )
      })
    })

    it("should navigate to custom redirectTo", async () => {
      mockSignInEmail.mockResolvedValue({ data: {}, error: null })

      const wrapperWithRedirect = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          navigate={mockNavigate}
          redirectTo="/dashboard"
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useSignInEmail(), {
        wrapper: wrapperWithRedirect
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      await action(formData)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard")
      })
    })
  })

  describe("error handling", () => {
    it("should handle EMAIL_NOT_VERIFIED error with resend option", async () => {
      mockSignInEmail.mockResolvedValue({
        data: null,
        error: {
          code: "EMAIL_NOT_VERIFIED",
          message: "Email not verified",
          statusText: "Email not verified"
        }
      })

      const { result } = renderHook(() => useSignInEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Email not verified",
          expect.objectContaining({
            action: expect.objectContaining({
              label: expect.any(String),
              onClick: expect.any(Function)
            })
          })
        )
      })
    })

    it("should resend verification email when user clicks action", async () => {
      let capturedAction: (() => Promise<void>) | null = null

      mockSignInEmail.mockResolvedValue({
        data: null,
        error: {
          code: "EMAIL_NOT_VERIFIED",
          message: "Email not verified",
          statusText: "Email not verified"
        }
      })

      mockToast.error.mockImplementation((message, options) => {
        if (options?.action?.onClick) {
          capturedAction = options.action.onClick
        }
        return "toast-id"
      })

      mockSendVerificationEmail.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      await action(formData)

      await waitFor(() => {
        expect(capturedAction).not.toBeNull()
      })

      // Execute the resend action
      if (capturedAction) {
        await capturedAction()
      }

      await waitFor(() => {
        expect(mockSendVerificationEmail).toHaveBeenCalledWith({
          email: "test@example.com",
          callbackURL: "http://localhost:3000/"
        })
        expect(mockToast.success).toHaveBeenCalled()
        expect(mockToast.dismiss).toHaveBeenCalledWith("toast-id")
      })
    })

    it("should handle resend verification email error", async () => {
      let capturedAction: (() => Promise<void>) | null = null

      mockSignInEmail.mockResolvedValue({
        data: null,
        error: {
          code: "EMAIL_NOT_VERIFIED",
          message: "Email not verified",
          statusText: "Email not verified"
        }
      })

      mockToast.error.mockImplementation((message, options) => {
        if (options?.action?.onClick) {
          capturedAction = options.action.onClick
        }
        return "toast-id"
      })

      mockSendVerificationEmail.mockResolvedValue({
        data: null,
        error: {
          message: "Failed to send email",
          statusText: "Failed to send email"
        }
      })

      const { result } = renderHook(() => useSignInEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      await action(formData)

      await waitFor(() => {
        expect(capturedAction).not.toBeNull()
      })

      if (capturedAction) {
        await capturedAction()
      }

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to send email")
      })
    })

    it("should handle generic sign in error", async () => {
      mockSignInEmail.mockResolvedValue({
        data: null,
        error: {
          message: "Invalid credentials",
          statusText: "Invalid credentials"
        }
      })

      const { result } = renderHook(() => useSignInEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "wrongpassword")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Invalid credentials")
      })
    })

    it("should clear password on error", async () => {
      mockSignInEmail.mockResolvedValue({
        data: null,
        error: {
          message: "Invalid credentials",
          statusText: "Invalid credentials"
        }
      })

      const { result } = renderHook(() => useSignInEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "wrongpassword")

      const newState = await action(formData)

      await waitFor(() => {
        expect(newState.email).toBe("test@example.com")
        expect(newState.password).toBe("")
      })
    })
  })

  describe("form state management", () => {
    it("should initialize with empty state", () => {
      const { result } = renderHook(() => useSignInEmail(), { wrapper })
      const [state] = result.current

      expect(state.email).toBe("")
      expect(state.password).toBe("")
    })

    it("should return updated state after successful sign in", async () => {
      mockSignInEmail.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      const newState = await action(formData)

      expect(newState.email).toBe("test@example.com")
      expect(newState.password).toBe("password123")
    })
  })

  describe("edge cases", () => {
    it("should handle missing email in formData", async () => {
      mockSignInEmail.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("password", "password123")

      await action(formData)

      await waitFor(() => {
        expect(mockSignInEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            email: null,
            password: "password123"
          }),
          { disableSignal: true }
        )
      })
    })

    it("should handle missing password in formData", async () => {
      mockSignInEmail.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")

      await action(formData)

      await waitFor(() => {
        expect(mockSignInEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "test@example.com",
            password: null
          }),
          { disableSignal: true }
        )
      })
    })

    it("should handle rememberMe checkbox unchecked", async () => {
      mockSignInEmail.mockResolvedValue({ data: {}, error: null })

      const wrapperWithRememberMe = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          navigate={mockNavigate}
          emailAndPassword={{ enabled: true, forgotPassword: true, rememberMe: true }}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useSignInEmail(), {
        wrapper: wrapperWithRememberMe
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")
      // rememberMe not added, so it should be false

      await action(formData)

      await waitFor(() => {
        expect(mockSignInEmail).toHaveBeenCalledWith(
          {
            email: "test@example.com",
            password: "password123",
            rememberMe: false
          },
          { disableSignal: true }
        )
      })
    })
  })
})