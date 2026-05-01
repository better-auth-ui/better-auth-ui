import { basePaths, viewPaths } from "@better-auth-ui/core"
import { magicLinkPlugin } from "@better-auth-ui/core/plugins"
import { renderHook } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AuthProvider, useAuth } from "../../src/components/auth/auth-provider"

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
    it("should throw error when AuthProvider is not provided", () => {
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow("[Better Auth UI] AuthProvider is required")
    })

    it("should return config when authClient is provided via context", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} navigate={() => {}}>
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.authClient).toBeDefined()
      expect(result.current.basePaths).toBeDefined()
      expect(result.current.viewPaths).toBeDefined()
    })
  })

  describe("default configuration", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider authClient={mockAuthClient} navigate={() => {}}>
        {children}
      </AuthProvider>
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

    it("should have navigate function that accepts replace option", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(typeof result.current.navigate).toBe("function")
    })
  })

  describe("configuration merging", () => {
    it("should use configurations from AuthProvider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          baseURL="http://example.com"
          redirectTo="/dashboard"
          navigate={() => {}}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.baseURL).toBe("http://example.com")
      expect(result.current.redirectTo).toBe("/dashboard")
    })

    it("should merge nested configurations from AuthProvider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          emailAndPassword={{ enabled: true, rememberMe: true }}
          navigate={() => {}}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

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
          navigate={() => {}}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.socialProviders).toEqual(["github", "google"])
    })
  })

  describe("plugins configuration", () => {
    it("should accept plugins array and expose registered plugins", () => {
      const plugin = magicLinkPlugin()
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider
          authClient={mockAuthClient}
          plugins={[plugin]}
          navigate={() => {}}
        >
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.plugins).toHaveLength(1)
      expect(result.current.plugins[0].id).toBe("magicLink")
    })

    it("should default to an empty plugins array", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} navigate={() => {}}>
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.plugins).toEqual([])
    })
  })
})
