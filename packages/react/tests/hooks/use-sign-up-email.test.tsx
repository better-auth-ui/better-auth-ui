import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useSignUpEmail } from "../../src/hooks/auth/use-sign-up-email"

// Mock better-auth
const mockSignUpEmail = vi.fn()
const mockRefetch = vi.fn()
const mockUseSession = vi.fn(() => ({
  data: null,
  isPending: false,
  error: null,
  refetch: mockRefetch
}))

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    signUp: {
      email: mockSignUpEmail
    },
    useSession: mockUseSession
  }))
}))

describe("useSignUpEmail", () => {
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
    mockRefetch.mockResolvedValue({})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("successful sign up", () => {
    it("should sign up with name, email, and password", async () => {
      mockSignUpEmail.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignUpEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("name", "Test User")
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      await action(formData)

      await waitFor(() => {
        expect(mockSignUpEmail).toHaveBeenCalledWith(
          {
            name: "Test User",
            email: "test@example.com",
            password: "password123"
          },
          { disableSignal: true }
        )
      })

      expect(mockRefetch).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith("/")
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

      const { result } = renderHook(() => useSignUpEmail(), {
        wrapper: wrapperWithConfirm
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("name", "Test User")
      formData.append("email", "test@example.com")
      formData.append("password", "password123")
      formData.append("confirmPassword", "differentPassword")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled()
        expect(mockSignUpEmail).not.toHaveBeenCalled()
      })
    })

    it("should allow matching passwords", async () => {
      mockSignUpEmail.mockResolvedValue({ data: {}, error: null })

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

      const { result } = renderHook(() => useSignUpEmail(), {
        wrapper: wrapperWithConfirm
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("name", "Test User")
      formData.append("email", "test@example.com")
      formData.append("password", "password123")
      formData.append("confirmPassword", "password123")

      await action(formData)

      await waitFor(() => {
        expect(mockSignUpEmail).toHaveBeenCalled()
      })
    })
  })

  describe("error handling", () => {
    it("should handle sign up error", async () => {
      mockSignUpEmail.mockResolvedValue({
        data: null,
        error: {
          message: "Email already exists",
          statusText: "Email already exists"
        }
      })

      const { result } = renderHook(() => useSignUpEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("name", "Test User")
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Email already exists")
      })
    })

    it("should clear passwords on error", async () => {
      mockSignUpEmail.mockResolvedValue({
        data: null,
        error: {
          message: "Sign up failed",
          statusText: "Sign up failed"
        }
      })

      const { result } = renderHook(() => useSignUpEmail(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("name", "Test User")
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      const newState = await action(formData)

      await waitFor(() => {
        expect(newState.password).toBe("")
        expect(newState.confirmPassword).toBe("")
      })
    })
  })

  describe("form state management", () => {
    it("should initialize with empty state", () => {
      const { result } = renderHook(() => useSignUpEmail(), { wrapper })
      const [state] = result.current

      expect(state.name).toBe("")
      expect(state.email).toBe("")
      expect(state.password).toBe("")
      expect(state.confirmPassword).toBe("")
    })
  })
})