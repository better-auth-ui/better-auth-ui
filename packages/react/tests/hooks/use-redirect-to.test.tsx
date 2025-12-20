import { renderHook } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useRedirectTo } from "../../src/hooks/auth/use-redirect-to"

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

describe("useRedirectTo", () => {
  const mockAuthClient = createAuthClient({
    baseURL: "http://localhost:3000"
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider authClient={mockAuthClient}>{children}</AuthProvider>
  )

  beforeEach(() => {
    // Reset URL before each test
    window.history.pushState({}, "", "/")
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("default behavior", () => {
    it("should return default redirectTo when no query param", () => {
      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should use custom redirectTo from config", () => {
      const { result } = renderHook(
        () => useRedirectTo({ redirectTo: "/dashboard" }),
        { wrapper }
      )

      expect(result.current).toBe("/dashboard")
    })
  })

  describe("query parameter validation", () => {
    it("should accept valid relative path", () => {
      window.history.pushState({}, "", "/?redirectTo=/dashboard")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard")
    })

    it("should accept valid nested path", () => {
      window.history.pushState({}, "", "/?redirectTo=/dashboard/settings")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard/settings")
    })

    it("should accept path with query parameters", () => {
      window.history.pushState({}, "", "/?redirectTo=/dashboard?tab=profile")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard?tab=profile")
    })

    it("should accept path with hash", () => {
      window.history.pushState({}, "", "/?redirectTo=/dashboard#section")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard#section")
    })
  })

  describe("open redirect prevention", () => {
    it("should reject protocol-relative URLs (//)", () => {
      window.history.pushState({}, "", "/?redirectTo=//evil.com")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should reject URLs with scheme (http://)", () => {
      window.history.pushState({}, "", "/?redirectTo=http://evil.com")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should reject URLs with scheme (https://)", () => {
      window.history.pushState({}, "", "/?redirectTo=https://evil.com")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should reject URLs with backslash (path normalization attack)", () => {
      window.history.pushState({}, "", "/?redirectTo=/\\evil.com")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should reject paths with backslashes", () => {
      window.history.pushState({}, "", "/?redirectTo=/path\\to\\somewhere")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should reject non-relative paths", () => {
      window.history.pushState({}, "", "/?redirectTo=evil.com")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should reject paths with javascript: scheme", () => {
      window.history.pushState({}, "", "/?redirectTo=javascript:alert(1)")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should reject paths with data: scheme", () => {
      window.history.pushState({}, "", "/?redirectTo=data:text/html,<script>")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })
  })

  describe("edge cases", () => {
    it("should handle empty redirectTo param", () => {
      window.history.pushState({}, "", "/?redirectTo=")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should handle whitespace in redirectTo param", () => {
      window.history.pushState({}, "", "/?redirectTo=   ")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should trim whitespace from valid path", () => {
      window.history.pushState({}, "", "/?redirectTo=  /dashboard  ")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard")
    })

    it("should handle URL encoded redirectTo", () => {
      window.history.pushState({}, "", "/?redirectTo=%2Fdashboard")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard")
    })

    it("should handle URL encoded with special chars", () => {
      window.history.pushState(
        {},
        "",
        "/?redirectTo=%2Fdashboard%3Ftab%3Dprofile"
      )

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard?tab=profile")
    })
  })
})