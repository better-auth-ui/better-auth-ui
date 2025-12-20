import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { act } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"
import { useUpdateUser } from "../../src/hooks/auth/use-update-user"

// Mock better-auth
vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null,
      refetch: vi.fn()
    })),
    updateUser: vi.fn()
  }))
}))

describe("useUpdateUser", () => {
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
  const mockRefetch = vi.fn()
  const mockUpdateUser = vi.fn()

  const mockAuthClient = createAuthClient({
    baseURL: "http://localhost:3000"
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthClient.useSession = vi.fn(() => ({
      data: null,
      isPending: false,
      error: null,
      refetch: mockRefetch
    }))
    mockAuthClient.updateUser = mockUpdateUser
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider authClient={mockAuthClient} toast={mockToast}>
      {children}
    </AuthProvider>
  )

  describe("successful user update", () => {
    it("should call updateUser with name from form data", async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "John Doe")

      await act(async () => {
        await updateUserAction(formData)
      })

      expect(mockUpdateUser).toHaveBeenCalledWith(
        { name: "John Doe" },
        { disableSignal: true }
      )
    })

    it("should refetch session after successful update", async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "Jane Smith")

      await act(async () => {
        await updateUserAction(formData)
      })

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled()
      })
    })

    it("should show success toast after successful update", async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "John Doe")

      await act(async () => {
        await updateUserAction(formData)
      })

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          "Profile updated successfully"
        )
      })
    })

    it("should return name in state", async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "Test User")

      await act(async () => {
        await updateUserAction(formData)
      })

      await waitFor(() => {
        expect(result.current[0].name).toBe("Test User")
      })
    })
  })

  describe("failed user update", () => {
    it("should show error toast when update fails", async () => {
      const error = { message: "Update failed", statusText: "Bad Request" }
      mockUpdateUser.mockResolvedValue({ error })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "John Doe")

      await act(async () => {
        await updateUserAction(formData)
      })

      expect(mockToast.error).toHaveBeenCalledWith("Update failed")
    })

    it("should use statusText when message is not available", async () => {
      const error = { message: "", statusText: "Internal Server Error" }
      mockUpdateUser.mockResolvedValue({ error })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "John Doe")

      await act(async () => {
        await updateUserAction(formData)
      })

      expect(mockToast.error).toHaveBeenCalledWith("Internal Server Error")
    })

    it("should not refetch session on error", async () => {
      const error = { message: "Error", statusText: "Error" }
      mockUpdateUser.mockResolvedValue({ error })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "John Doe")

      await act(async () => {
        await updateUserAction(formData)
      })

      expect(mockRefetch).not.toHaveBeenCalled()
    })

    it("should not show success toast on error", async () => {
      const error = { message: "Error", statusText: "Error" }
      mockUpdateUser.mockResolvedValue({ error })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "John Doe")

      await act(async () => {
        await updateUserAction(formData)
      })

      expect(mockToast.success).not.toHaveBeenCalled()
    })
  })

  describe("initial state", () => {
    it("should initialize with empty name", () => {
      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [state] = result.current

      expect(state.name).toBe("")
    })
  })

  describe("form data handling", () => {
    it("should handle missing name field", async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()

      await act(async () => {
        await updateUserAction(formData)
      })

      expect(mockUpdateUser).toHaveBeenCalledWith(
        { name: null },
        { disableSignal: true }
      )
    })

    it("should handle empty string name", async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "")

      await act(async () => {
        await updateUserAction(formData)
      })

      expect(mockUpdateUser).toHaveBeenCalledWith(
        { name: "" },
        { disableSignal: true }
      )
    })

    it("should handle special characters in name", async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useUpdateUser(), { wrapper })
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "José García-Pérez")

      await act(async () => {
        await updateUserAction(formData)
      })

      expect(mockUpdateUser).toHaveBeenCalledWith(
        { name: "José García-Pérez" },
        { disableSignal: true }
      )
    })
  })

  describe("custom configuration", () => {
    it("should use custom localization", async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      const customLocalization = {
        auth: {} as any,
        settings: {
          settings: "",
          account: "",
          security: "",
          profile: "",
          saveChanges: "",
          profileUpdatedSuccess: "Custom success message"
        }
      }

      const { result } = renderHook(
        () => useUpdateUser({ localization: customLocalization }),
        { wrapper }
      )
      const [, updateUserAction] = result.current

      const formData = new FormData()
      formData.set("name", "John Doe")

      await act(async () => {
        await updateUserAction(formData)
      })

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith("Custom success message")
      })
    })
  })
})
