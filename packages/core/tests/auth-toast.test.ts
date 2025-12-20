import { describe, expect, it, vi } from "vitest"
import { defaultToast, type Toast } from "../src/lib/auth-toast"

describe("auth-toast", () => {
  describe("defaultToast", () => {
    it("should display alert with message when no action provided", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

      defaultToast("Test message")

      expect(alertSpy).toHaveBeenCalledWith("Test message")
      alertSpy.mockRestore()
    })

    it("should handle undefined message", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

      defaultToast(undefined)

      expect(alertSpy).toHaveBeenCalledWith(undefined)
      alertSpy.mockRestore()
    })

    it("should use confirm and call action onClick when action provided and user confirms", () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
      const actionFn = vi.fn()

      defaultToast("Confirm action?", {
        action: { label: "Confirm", onClick: actionFn }
      })

      expect(confirmSpy).toHaveBeenCalledWith("Confirm action?")
      expect(actionFn).toHaveBeenCalledTimes(1)
      confirmSpy.mockRestore()
    })

    it("should not call action onClick when user cancels", () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)
      const actionFn = vi.fn()

      defaultToast("Cancel action?", {
        action: { label: "Cancel", onClick: actionFn }
      })

      expect(confirmSpy).toHaveBeenCalledWith("Cancel action?")
      expect(actionFn).not.toHaveBeenCalled()
      confirmSpy.mockRestore()
    })

    it("should handle async action onClick", async () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
      const asyncAction = vi.fn().mockResolvedValue("done")

      defaultToast("Async action?", {
        action: { label: "Do it", onClick: asyncAction }
      })

      expect(confirmSpy).toHaveBeenCalledWith("Async action?")
      expect(asyncAction).toHaveBeenCalledTimes(1)

      await asyncAction()
      expect(await asyncAction.mock.results[0]?.value).toBe("done")
      confirmSpy.mockRestore()
    })

    it("should handle action with empty label", () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
      const actionFn = vi.fn()

      defaultToast("Action", {
        action: { label: "", onClick: actionFn }
      })

      expect(confirmSpy).toHaveBeenCalled()
      expect(actionFn).toHaveBeenCalled()
      confirmSpy.mockRestore()
    })
  })

  describe("Toast type", () => {
    it("should conform to Toast interface for complete implementation", () => {
      const mockToast: Toast = {
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn(),
        dismiss: vi.fn()
      }

      mockToast.error("Error message")
      mockToast.success("Success message")
      mockToast.info("Info message")
      mockToast.dismiss?.("toast-id")

      expect(mockToast.error).toHaveBeenCalledWith("Error message")
      expect(mockToast.success).toHaveBeenCalledWith("Success message")
      expect(mockToast.info).toHaveBeenCalledWith("Info message")
      expect(mockToast.dismiss).toHaveBeenCalledWith("toast-id")
    })

    it("should work without optional dismiss method", () => {
      const mockToast: Toast = {
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn()
      }

      expect(mockToast.dismiss).toBeUndefined()

      mockToast.error("Error")
      expect(mockToast.error).toHaveBeenCalledWith("Error")
    })
  })
})
