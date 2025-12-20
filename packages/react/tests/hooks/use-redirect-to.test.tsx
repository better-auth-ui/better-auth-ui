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

    it("should return custom redirectTo from config when no query param", () => {
      const customWrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider authClient={mockAuthClient} redirectTo="/dashboard">
          {children}
        </AuthProvider>
      )

      const { result } = renderHook(() => useRedirectTo(), {
        wrapper: customWrapper
      })

      expect(result.current).toBe("/dashboard")
    })
  })

  describe("valid redirectTo query parameter", () => {
    it("should return valid relative path from query param", () => {
      window.history.pushState({}, "", "/?redirectTo=/dashboard")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard")
    })

    it("should handle nested paths", () => {
      window.history.pushState({}, "", "/?redirectTo=/users/profile/settings")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/users/profile/settings")
    })

    it("should handle paths with query params", () => {
      window.history.pushState({}, "", "/?redirectTo=/dashboard?tab=overview")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard?tab=overview")
    })

    it("should handle paths with hash fragments", () => {
      window.history.pushState({}, "", "/?redirectTo=/page#section")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/page#section")
    })

    it("should handle encoded paths", () => {
      const encodedPath = encodeURIComponent("/dashboard?search=test value")
      window.history.pushState({}, "", `/?redirectTo=${encodedPath}`)

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard?search=test value")
    })
  })

  describe("open redirect prevention", () => {
    it("should reject protocol-relative URLs (//)", () => {
      window.history.pushState({}, "", "/?redirectTo=//evil.com")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
      expect(result.current).not.toBe("//evil.com")
    })

    it("should reject URLs with http scheme", () => {
      window.history.pushState({}, "", "/?redirectTo=http://evil.com")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
      expect(result.current).not.toContain("http://")
    })

    it("should reject URLs with https scheme", () => {
      window.history.pushState({}, "", "/?redirectTo=https://evil.com")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
      expect(result.current).not.toContain("https://")
    })

    it("should reject URLs with javascript scheme", () => {
      window.history.pushState({}, "", "/?redirectTo=javascript:alert(1)")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
      expect(result.current).not.toContain("javascript:")
    })

    it("should reject URLs with backslashes", () => {
      window.history.pushState({}, "", "/?redirectTo=/\\evil.com")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
      expect(result.current).not.toContain("\\")
    })

    it("should reject URLs that don't start with /", () => {
      window.history.pushState({}, "", "/?redirectTo=evil.com/path")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should reject empty string", () => {
      window.history.pushState({}, "", "/?redirectTo=")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })

    it("should reject whitespace-only paths", () => {
      window.history.pushState({}, "", "/?redirectTo=%20%20%20")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/")
    })
  })

  describe("edge cases", () => {
    it("should handle trimming whitespace", () => {
      window.history.pushState({}, "", "/?redirectTo=%20/dashboard%20")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard")
    })

    it("should handle multiple query parameters", () => {
      window.history.pushState(
        {},
        "",
        "/?foo=bar&redirectTo=/dashboard&baz=qux"
      )

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/dashboard")
    })

    it("should use first redirectTo if multiple present", () => {
      window.history.pushState({}, "", "/?redirectTo=/first&redirectTo=/second")

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/first")
    })

    it("should handle special characters in path", () => {
      window.history.pushState(
        {},
        "",
        "/?redirectTo=/path-with-dash/and_underscore"
      )

      const { result } = renderHook(() => useRedirectTo(), { wrapper })

      expect(result.current).toBe("/path-with-dash/and_underscore")
    })
  })

  describe("config override", () => {
    it("should allow redirectTo override via config parameter", () => {
      const { result } = renderHook(
        () => useRedirectTo({ redirectTo: "/custom" }),
        { wrapper }
      )

      expect(result.current).toBe("/custom")
    })

    it("should prioritize valid query param over config override", () => {
      window.history.pushState({}, "", "/?redirectTo=/from-query")

      const { result } = renderHook(
        () => useRedirectTo({ redirectTo: "/from-config" }),
        { wrapper }
      )

      expect(result.current).toBe("/from-query")
    })

    it("should fall back to config override if query param is invalid", () => {
      window.history.pushState({}, "", "/?redirectTo=//evil.com")

      const { result } = renderHook(
        () => useRedirectTo({ redirectTo: "/safe-fallback" }),
        { wrapper }
      )

      expect(result.current).toBe("/safe-fallback")
    })
  })
})
