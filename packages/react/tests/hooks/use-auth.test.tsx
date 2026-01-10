import { basePaths, viewPaths } from "@better-auth-ui/core"
import { renderHook } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useAuth } from "../../src/hooks/auth/use-auth"

// Mock better-auth
vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null
    }))
  }))
}))

describe("useAuth", () => {
  const mockAuthClient = createAuthClient({
    baseURL: "http://localhost:3000"
  })

  afterEach(() => {
    vi.clearAllMocks()
    // Reset URL to base
    window.history.pushState({}, "", "/")
  })

  describe("basic functionality", () => {
    it("should throw error when authClient is not provided", () => {
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow()
    })

    it("should return config when authClient is provided via context", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient}>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.authClient).toBeDefined()
      expect(result.current.basePaths).toBeDefined()
      expect(result.current.viewPaths).toBeDefined()
    })

    it("should return config when authClient is provided via argument", () => {
      const { result } = renderHook(() =>
        useAuth({ authClient: mockAuthClient })
      )

      expect(result.current.authClient).toBeDefined()
      expect(result.current.basePaths).toBeDefined()
      expect(result.current.viewPaths).toBeDefined()
    })
  })

  describe("default configuration", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider authClient={mockAuthClient}>{children}</AuthProvider>
    )

    it("should have default basePaths", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.basePaths).toEqual(basePaths)
    })

    it("should have default viewPaths", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.viewPaths).toEqual(viewPaths)
    })

    it("should have default redirectTo", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.redirectTo).toBe("/")
    })

    it("should have default baseURL as empty string", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.baseURL).toBe("")
    })

    it("should have navigate function", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(typeof result.current.navigate).toBe("function")
    })

    it("should have replace function", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(typeof result.current.replace).toBe("function")
    })

    it("should have Link component", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(typeof result.current.Link).toBe("function")
    })
  })

  describe("configuration merging", () => {
    it("should merge context and prop configurations", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} baseURL="http://example.com">
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(
        () => useAuth({ redirectTo: "/dashboard" }),
        { wrapper }
      )

      expect(result.current.baseURL).toBe("http://example.com")
      expect(result.current.redirectTo).toBe("/dashboard")
    })

    it("should override context config with prop config", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} redirectTo="/home">
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(
        () => useAuth({ redirectTo: "/dashboard" }),
        { wrapper }
      )

      expect(result.current.redirectTo).toBe("/dashboard")
    })

    it("should deep merge nested configurations", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          emailAndPassword={{ enabled: true }}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(
        () => useAuth({ emailAndPassword: { rememberMe: true } }),
        { wrapper }
      )

      expect(result.current.emailAndPassword?.enabled).toBe(true)
      expect(result.current.emailAndPassword?.rememberMe).toBe(true)
    })
  })

  describe("social providers configuration", () => {
    it("should accept social providers array", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          socialProviders={["github", "google"]}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.socialProviders).toEqual(["github", "google"])
    })
  })

  describe("magic link configuration", () => {
    it("should accept magicLink boolean", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} magicLink={true}>
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.magicLink).toBe(true)
    })
  })
})
