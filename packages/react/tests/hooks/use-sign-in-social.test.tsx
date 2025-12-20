import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useSignInSocial } from "../../src/hooks/auth/use-sign-in-social"

const mockSignInSocial = vi.fn()
const mockUseSession = vi.fn(() => ({
  data: null,
  isPending: false,
  error: null
}))

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    signIn: {
      social: mockSignInSocial
    },
    useSession: mockUseSession
  }))
}))

describe("useSignInSocial", () => {
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

  describe("successful social sign in", () => {
    it("should sign in with social provider", async () => {
      mockSignInSocial.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("provider", "github")

      await action(formData)

      await waitFor(() => {
        expect(mockSignInSocial).toHaveBeenCalledWith({
          provider: "github",
          callbackURL: "http://localhost:3000/"
        })
      })
    })

    it("should use custom redirectTo in callbackURL", async () => {
      mockSignInSocial.mockResolvedValue({ data: {}, error: null })

      const wrapperWithRedirect = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          redirectTo="/dashboard"
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useSignInSocial(), {
        wrapper: wrapperWithRedirect
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("provider", "google")

      await action(formData)

      await waitFor(() => {
        expect(mockSignInSocial).toHaveBeenCalledWith({
          provider: "google",
          callbackURL: "http://localhost:3000/dashboard"
        })
      })
    })

    it("should handle different providers", async () => {
      mockSignInSocial.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, action] = result.current

      const providers = ["github", "google", "discord", "facebook"]

      for (const provider of providers) {
        const formData = new FormData()
        formData.append("provider", provider)

        await action(formData)

        await waitFor(() => {
          expect(mockSignInSocial).toHaveBeenCalledWith({
            provider,
            callbackURL: "http://localhost:3000/"
          })
        })

        mockSignInSocial.mockClear()
      }
    })
  })

  describe("error handling", () => {
    it("should handle social sign in error", async () => {
      mockSignInSocial.mockResolvedValue({
        data: null,
        error: {
          message: "Provider not configured",
          statusText: "Provider not configured"
        }
      })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("provider", "github")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Provider not configured")
      })
    })

    it("should handle network errors", async () => {
      mockSignInSocial.mockResolvedValue({
        data: null,
        error: {
          message: "Network error",
          statusText: "Network error"
        }
      })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("provider", "google")

      await action(formData)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Network error")
      })
    })
  })

  describe("form state management", () => {
    it("should initialize with empty provider", () => {
      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [state] = result.current

      expect(state.provider).toBe("")
    })

    it("should return provider in state after submission", async () => {
      mockSignInSocial.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("provider", "github")

      const newState = await action(formData)

      expect(newState.provider).toBe("github")
    })
  })

  describe("edge cases", () => {
    it("should handle missing provider in formData", async () => {
      mockSignInSocial.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useSignInSocial(), { wrapper })
      const [, action] = result.current

      const formData = new FormData()

      await action(formData)

      await waitFor(() => {
        expect(mockSignInSocial).toHaveBeenCalledWith({
          provider: null,
          callbackURL: "http://localhost:3000/"
        })
      })
    })

    it("should use baseURL in callbackURL", async () => {
      mockSignInSocial.mockResolvedValue({ data: {}, error: null })

      const wrapperWithBaseURL = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          toast={mockToast}
          baseURL="https://api.example.com"
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useSignInSocial(), {
        wrapper: wrapperWithBaseURL
      })
      const [, action] = result.current

      const formData = new FormData()
      formData.append("provider", "github")

      await action(formData)

      await waitFor(() => {
        expect(mockSignInSocial).toHaveBeenCalledWith({
          provider: "github",
          callbackURL: "https://api.example.com/"
        })
      })
    })
  })
})