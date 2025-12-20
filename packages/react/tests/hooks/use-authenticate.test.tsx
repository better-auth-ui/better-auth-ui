import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useAuthenticate } from "../../src/hooks/auth/use-authenticate"

const mockUseSession = vi.fn()

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    useSession: mockUseSession
  }))
}))

describe("useAuthenticate", () => {
  const mockAuthClient = createAuthClient({ baseURL: "http://localhost:3000" })
  const mockReplace = vi.fn()

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider authClient={mockAuthClient} replace={mockReplace}>
      {children}
    </AuthProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset URL
    delete (window as any).location
    ;(window as any).location = {
      pathname: "/dashboard",
      search: ""
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("authenticated user", () => {
    it("should return session data for authenticated user", () => {
      const mockSession = {
        user: { id: "123", email: "test@example.com" },
        session: { id: "session-123" }
      }

      mockUseSession.mockReturnValue({
        data: mockSession,
        isPending: false,
        error: null
      })

      const { result } = renderHook(() => useAuthenticate(), { wrapper })

      expect(result.current.data).toEqual(mockSession)
      expect(result.current.isPending).toBe(false)
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it("should not redirect when user is authenticated", () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "123" } },
        isPending: false,
        error: null
      })

      renderHook(() => useAuthenticate(), { wrapper })

      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  describe("unauthenticated user", () => {
    it("should redirect to sign-in when unauthenticated", async () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null
      })

      renderHook(() => useAuthenticate(), { wrapper })

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/auth/sign-in?redirectTo=%2Fdashboard"
        )
      })
    })

    it("should preserve current URL in redirectTo parameter", async () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null
      })

      ;(window as any).location.pathname = "/settings/profile"
      ;(window as any).location.search = "?tab=security"

      renderHook(() => useAuthenticate(), { wrapper })

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/auth/sign-in?redirectTo=%2Fsettings%2Fprofile%3Ftab%3Dsecurity"
        )
      })
    })

    it("should use custom basePaths", async () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null
      })

      const wrapperWithCustomPaths = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          replace={mockReplace}
          basePaths={{
            auth: "/custom-auth",
            settings: "/settings",
            organization: "/org"
          }}
        >
          {children}
        </AuthProvider>
      )

      renderHook(() => useAuthenticate(), {
        wrapper: wrapperWithCustomPaths
      })

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/custom-auth/sign-in?redirectTo=%2Fdashboard"
        )
      })
    })
  })

  describe("loading state", () => {
    it("should not redirect while loading", () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: true,
        error: null
      })

      renderHook(() => useAuthenticate(), { wrapper })

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it("should return isPending state", () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: true,
        error: null
      })

      const { result } = renderHook(() => useAuthenticate(), { wrapper })

      expect(result.current.isPending).toBe(true)
    })
  })

  describe("additional session properties", () => {
    it("should pass through additional useSession properties", () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "123" } },
        isPending: false,
        error: null,
        refetch: vi.fn(),
        isLoading: false
      })

      const { result } = renderHook(() => useAuthenticate(), { wrapper })

      expect(result.current.refetch).toBeDefined()
      expect(result.current.isLoading).toBeDefined()
    })
  })

  describe("URL encoding", () => {
    it("should properly encode special characters in URL", async () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null
      })

      ;(window as any).location.pathname = "/search"
      ;(window as any).location.search = "?q=hello world&filter=new"

      renderHook(() => useAuthenticate(), { wrapper })

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.stringContaining("redirectTo=%2Fsearch%3Fq%3Dhello%20world%26filter%3Dnew")
        )
      })
    })
  })
})