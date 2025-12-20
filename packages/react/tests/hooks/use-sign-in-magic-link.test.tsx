import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useSignInMagicLink } from "../../src/hooks/auth/use-sign-in-magic-link"

const mockSignInMagicLink = vi.fn()
const mockUseSession = vi.fn(() => ({
  data: null,
  isPending: false,
  error: null
}))

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    signIn: {
      magicLink: mockSignInMagicLink
    },
    useSession: mockUseSession
  }))
}))

describe("useSignInMagicLink", () => {
  const mockAuthClient = createAuthClient({ baseURL: "http://localhost:3000" })
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider authClient={mockAuthClient} toast={mockToast}>
      {children}
    </AuthProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("successful magic link request", () => {
    it("should send magic link to email", async () => {
      mockSignInMagicLink.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")

      await action(formData)

      await waitFor(() => {
        expect(mockSignInMagicLink).toHaveBeenCalledWith({
          email: "test@example.com",
          callbackURL: "http://localhost:3000/"
        })
      })

      expect(mockToast.success).toHaveBeenCalled()
    })

    it("should clear email after successful send", async () => {
      mockSignInMagicLink.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")

      const newState = await action(formData)

      await waitFor(() => {
        expect(newState.email).toBe("")
      })
    })

    it("should use custom redirectTo in callbackURL", async () => {
      mockSignInMagicLink.mockResolvedValue({ data: {}, error: null })

      const wrapperWithRedirect = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          redirectTo="/dashboard"
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useSignInMagicLink(), {
        wrapper: wrapperWithRedirect
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")

      await action(formData)

      await waitFor(() => {
        expect(mockSignInMagicLink).toHaveBeenCalledWith({
          email: "test@example.com",
          callbackURL: "http://localhost:3000/dashboard"
        })
      })
    })
  })

  describe("error handling", () => {
    it("should handle magic link error", async () => {
      mockSignInMagicLink.mockResolvedValue({
        data: null,
        error: {
          message: "Failed to send magic link",
          statusText: "Failed to send magic link"
        }
      })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Failed to send magic link"
        )
      })
    })

    it("should keep email in state on error", async () => {
      mockSignInMagicLink.mockResolvedValue({
        data: null,
        error: {
          message: "Error",
          statusText: "Error"
        }
      })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("email", "test@example.com")

      const newState = await action(formData)

      await waitFor(() => {
        expect(newState.email).toBe("test@example.com")
      })
    })
  })

  describe("form state management", () => {
    it("should initialize with empty email", () => {
      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [state] = result.current

      expect(state.email).toBe("")
    })
  })
})
