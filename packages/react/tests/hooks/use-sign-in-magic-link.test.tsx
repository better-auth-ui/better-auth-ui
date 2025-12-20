import { renderHook } from "@testing-library/react"
import { act } from "react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useSignInMagicLink } from "../../src/hooks/auth/use-sign-in-magic-link"

// Mock better-auth
vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null
    })),
    signIn: {
      magicLink: vi.fn()
    }
  }))
}))

describe("useSignInMagicLink", () => {
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
  const mockSignInMagicLink = vi.fn()

  const mockAuthClient = createAuthClient({
    baseURL: "http://localhost:3000"
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthClient.signIn.magicLink = mockSignInMagicLink
    window.history.pushState({}, "", "/")
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider authClient={mockAuthClient} toast={mockToast} baseURL="https://example.com">
      {children}
    </AuthProvider>
  )

  describe("successful magic link sign in", () => {
    it("should call signIn.magicLink with email and callbackURL", async () => {
      mockSignInMagicLink.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(mockSignInMagicLink).toHaveBeenCalledWith({
        email: "test@example.com",
        callbackURL: "https://example.com/"
      })
    })

    it("should show success toast on successful request", async () => {
      mockSignInMagicLink.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(mockToast.success).toHaveBeenCalledWith("Magic link sent to your email")
    })

    it("should clear email in state after success", async () => {
      mockSignInMagicLink.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(result.current[0].email).toBe("")
    })

    it("should use redirectTo from query param", async () => {
      mockSignInMagicLink.mockResolvedValue({ error: null })
      window.history.pushState({}, "", "/?redirectTo=/dashboard")

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(mockSignInMagicLink).toHaveBeenCalledWith({
        email: "test@example.com",
        callbackURL: "https://example.com/dashboard"
      })
    })
  })

  describe("failed magic link sign in", () => {
    it("should show error toast when request fails", async () => {
      const error = { message: "Invalid email", statusText: "Bad Request" }
      mockSignInMagicLink.mockResolvedValue({ error })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "invalid@example.com")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(mockToast.error).toHaveBeenCalledWith("Invalid email")
    })

    it("should use statusText when message is not available", async () => {
      const error = { message: "", statusText: "Service Unavailable" }
      mockSignInMagicLink.mockResolvedValue({ error })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(mockToast.error).toHaveBeenCalledWith("Service Unavailable")
    })

    it("should keep email in state on error", async () => {
      const error = { message: "Error", statusText: "Error" }
      mockSignInMagicLink.mockResolvedValue({ error })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(result.current[0].email).toBe("test@example.com")
    })

    it("should not show success toast on error", async () => {
      const error = { message: "Error", statusText: "Error" }
      mockSignInMagicLink.mockResolvedValue({ error })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(mockToast.success).not.toHaveBeenCalled()
    })
  })

  describe("custom configuration", () => {
    it("should use custom baseURL", async () => {
      mockSignInMagicLink.mockResolvedValue({ error: null })

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          baseURL="https://custom.com"
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useSignInMagicLink(), {
        wrapper: customWrapper
      })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(mockSignInMagicLink).toHaveBeenCalledWith({
        email: "test@example.com",
        callbackURL: "https://custom.com/"
      })
    })

    it("should use custom redirectTo", async () => {
      mockSignInMagicLink.mockResolvedValue({ error: null })

      const { result } = renderHook(
        () => useSignInMagicLink({ redirectTo: "/custom-redirect" }),
        { wrapper }
      )
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "test@example.com")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(mockSignInMagicLink).toHaveBeenCalledWith({
        email: "test@example.com",
        callbackURL: "https://example.com/custom-redirect"
      })
    })
  })

  describe("initial state", () => {
    it("should initialize with empty email", () => {
      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [state] = result.current

      expect(state.email).toBe("")
    })
  })

  describe("form data handling", () => {
    it("should handle missing email", async () => {
      mockSignInMagicLink.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(mockSignInMagicLink).toHaveBeenCalledWith({
        email: null,
        callbackURL: "https://example.com/"
      })
    })

    it("should handle empty string email", async () => {
      mockSignInMagicLink.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignInMagicLink(), { wrapper })
      const [, signInMagicLinkAction] = result.current

      const formData = new FormData()
      formData.set("email", "")

      await act(async () => {
        await signInMagicLinkAction(formData)
      })

      expect(mockSignInMagicLink).toHaveBeenCalledWith({
        email: "",
        callbackURL: "https://example.com/"
      })
    })
  })
})