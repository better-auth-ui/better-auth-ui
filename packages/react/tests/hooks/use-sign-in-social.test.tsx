import { renderHook } from "@testing-library/react"
import { act } from "react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useSignInSocial } from "../../src/hooks/auth/use-sign-in-social"

// Mock better-auth
vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null
    })),
    signIn: {
      social: vi.fn()
    }
  }))
}))

describe("useSignInSocial", () => {
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
  const mockSignInSocial = vi.fn()

  const mockAuthClient = createAuthClient({
    baseURL: "http://localhost:3000"
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthClient.signIn.social = mockSignInSocial
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

  describe("successful social sign in", () => {
    it("should call signIn.social with provider and callbackURL", async () => {
      mockSignInSocial.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, signInSocialAction] = result.current

      const formData = new FormData()
      formData.set("provider", "google")

      await act(async () => {
        await signInSocialAction(formData)
      })

      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "https://example.com/"
      })
    })

    it("should use redirectTo from query param", async () => {
      mockSignInSocial.mockResolvedValue({ error: null })
      window.history.pushState({}, "", "/?redirectTo=/dashboard")

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, signInSocialAction] = result.current

      const formData = new FormData()
      formData.set("provider", "github")

      await act(async () => {
        await signInSocialAction(formData)
      })

      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: "github",
        callbackURL: "https://example.com/dashboard"
      })
    })

    it("should not show error toast on success", async () => {
      mockSignInSocial.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, signInSocialAction] = result.current

      const formData = new FormData()
      formData.set("provider", "google")

      await act(async () => {
        await signInSocialAction(formData)
      })

      expect(mockToast.error).not.toHaveBeenCalled()
    })

    it("should return provider in state", async () => {
      mockSignInSocial.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, signInSocialAction] = result.current

      const formData = new FormData()
      formData.set("provider", "github")

      await act(async () => {
        await signInSocialAction(formData)
      })

      expect(result.current[0].provider).toBe("github")
    })
  })

  describe("failed social sign in", () => {
    it("should show error toast when sign in fails", async () => {
      const error = { message: "Provider error", statusText: "Bad Request" }
      mockSignInSocial.mockResolvedValue({ error })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, signInSocialAction] = result.current

      const formData = new FormData()
      formData.set("provider", "google")

      await act(async () => {
        await signInSocialAction(formData)
      })

      expect(mockToast.error).toHaveBeenCalledWith("Provider error")
    })

    it("should use statusText when message is not available", async () => {
      const error = { message: "", statusText: "Unauthorized" }
      mockSignInSocial.mockResolvedValue({ error })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, signInSocialAction] = result.current

      const formData = new FormData()
      formData.set("provider", "google")

      await act(async () => {
        await signInSocialAction(formData)
      })

      expect(mockToast.error).toHaveBeenCalledWith("Unauthorized")
    })
  })

  describe("different providers", () => {
    const providers = ["google", "github", "facebook", "discord", "apple"]

    providers.forEach((provider) => {
      it(`should handle ${provider} provider`, async () => {
        mockSignInSocial.mockResolvedValue({ error: null })

        const { result } = renderHook(() => useSignInSocial(), { wrapper })
        const [, signInSocialAction] = result.current

        const formData = new FormData()
        formData.set("provider", provider)

        await act(async () => {
          await signInSocialAction(formData)
        })

        expect(mockSignInSocial).toHaveBeenCalledWith({
          provider,
          callbackURL: "https://example.com/"
        })
      })
    })
  })

  describe("custom configuration", () => {
    it("should use custom baseURL", async () => {
      mockSignInSocial.mockResolvedValue({ error: null })

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          baseURL="https://custom.com"
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useSignInSocial(), {
        wrapper: customWrapper
      })
      const [, signInSocialAction] = result.current

      const formData = new FormData()
      formData.set("provider", "google")

      await act(async () => {
        await signInSocialAction(formData)
      })

      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "https://custom.com/"
      })
    })

    it("should use custom redirectTo", async () => {
      mockSignInSocial.mockResolvedValue({ error: null })

      const { result } = renderHook(
        () => useSignInSocial({ redirectTo: "/custom-redirect" }),
        { wrapper }
      )
      const [, signInSocialAction] = result.current

      const formData = new FormData()
      formData.set("provider", "google")

      await act(async () => {
        await signInSocialAction(formData)
      })

      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "https://example.com/custom-redirect"
      })
    })
  })

  describe("initial state", () => {
    it("should initialize with empty provider", () => {
      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [state] = result.current

      expect(state.provider).toBe("")
    })
  })

  describe("form data handling", () => {
    it("should handle missing provider", async () => {
      mockSignInSocial.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, signInSocialAction] = result.current

      const formData = new FormData()

      await act(async () => {
        await signInSocialAction(formData)
      })

      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: null,
        callbackURL: "https://example.com/"
      })
    })
  })
})