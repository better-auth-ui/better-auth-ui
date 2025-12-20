import { describe, expect, it, vi } from "vitest"
import {
  type DismissToast,
  defaultToast,
  type RenderToast
} from "../src/lib/auth-toast"

describe("auth-toast", () => {
  describe("defaultToast", () => {
    it("should be a function", () => {
      expect(typeof defaultToast).toBe("function")
    })

    it("should call alert when no action is provided", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

      defaultToast("Test message")

      expect(alertSpy).toHaveBeenCalledWith("Test message")
      alertSpy.mockRestore()
    })

    it("should call confirm and execute action when action is provided", () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
      const actionFn = vi.fn()

      defaultToast("Test message", {
        action: {
          label: "Click me",
          onClick: actionFn
        }
      })

      expect(confirmSpy).toHaveBeenCalledWith("Test message")
      expect(actionFn).toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it("should not execute action when user cancels confirm", () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)
      const actionFn = vi.fn()

      defaultToast("Test message", {
        action: {
          label: "Click me",
          onClick: actionFn
        }
      })

      expect(confirmSpy).toHaveBeenCalledWith("Test message")
      expect(actionFn).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it("should handle async action functions", async () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
      const asyncAction = vi.fn().mockResolvedValue(undefined)

      defaultToast("Test message", {
        action: {
          label: "Async action",
          onClick: asyncAction
        }
      })

      expect(confirmSpy).toHaveBeenCalled()
      expect(asyncAction).toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it("should accept undefined message", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

      defaultToast(undefined)

      expect(alertSpy).toHaveBeenCalled()
      alertSpy.mockRestore()
    })
  })

  describe("RenderToast type", () => {
    it("should allow custom toast implementations", () => {
      const customToast: RenderToast = (message, options) => {
        // Custom implementation
        return `toast-${message}`
      }

      const result = customToast("Test")
      expect(result).toBe("toast-Test")
    })

    it("should allow returning different types", () => {
      const toastReturningNumber: RenderToast = () => 123
      const toastReturningString: RenderToast = () => "id-123"
      const toastReturningObject: RenderToast = () => ({ id: 1 })

      expect(toastReturningNumber()).toBe(123)
      expect(toastReturningString()).toBe("id-123")
      expect(typeof toastReturningObject()).toBe("object")
    })

    it("should handle action options", () => {
      const customToast: RenderToast = (message, options) => {
        if (options?.action) {
          options.action.onClick()
          return `action-${options.action.label}`
        }
        return message
      }

      const mockFn = vi.fn()
      const result = customToast("Test", {
        action: {
          label: "Undo",
          onClick: mockFn
        }
      })

      expect(result).toBe("action-Undo")
      expect(mockFn).toHaveBeenCalled()
    })
  })

  describe("DismissToast type", () => {
    it("should allow custom dismiss implementations", () => {
      const customDismiss: DismissToast = (id) => {
        return `dismissed-${id}`
      }

      expect(customDismiss(123)).toBe("dismissed-123")
      expect(customDismiss("abc")).toBe("dismissed-abc")
    })

    it("should handle undefined id", () => {
      const customDismiss: DismissToast = (id) => {
        if (!id) return "dismissed-all"
        return `dismissed-${id}`
      }

      expect(customDismiss()).toBe("dismissed-all")
      expect(customDismiss(undefined)).toBe("dismissed-all")
    })

    it("should handle various id types", () => {
      const customDismiss: DismissToast = (id) => {
        return id
      }

      expect(customDismiss(123)).toBe(123)
      expect(customDismiss("string-id")).toBe("string-id")
      expect(customDismiss({ id: 1 })).toEqual({ id: 1 })
    })
  })

  describe("Toast type", () => {
    it("should require error, success, and info functions", () => {
      const mockToast = {
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn()
      }

      mockToast.error("Error message")
      mockToast.success("Success message")
      mockToast.info("Info message")

      expect(mockToast.error).toHaveBeenCalledWith("Error message")
      expect(mockToast.success).toHaveBeenCalledWith("Success message")
      expect(mockToast.info).toHaveBeenCalledWith("Info message")
    })

    it("should allow optional dismiss function", () => {
      const mockToastWithDismiss = {
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn(),
        dismiss: vi.fn()
      }

      mockToastWithDismiss.dismiss(123)
      expect(mockToastWithDismiss.dismiss).toHaveBeenCalledWith(123)
    })

    it("should work without dismiss function", () => {
      const mockToastWithoutDismiss = {
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn()
      }

      // Should not have dismiss function
      expect(mockToastWithoutDismiss.dismiss).toBeUndefined()
    })
  })

  describe("edge cases", () => {
    it("should handle empty string messages", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

      defaultToast("")

      expect(alertSpy).toHaveBeenCalledWith("")
      alertSpy.mockRestore()
    })

    it("should handle action with empty label", () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
      const actionFn = vi.fn()

      defaultToast("Message", {
        action: {
          label: "",
          onClick: actionFn
        }
      })

      expect(confirmSpy).toHaveBeenCalled()
      expect(actionFn).toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it("should handle action that throws error", () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
      const actionFn = vi.fn().mockImplementation(() => {
        throw new Error("Action error")
      })

      expect(() => {
        defaultToast("Message", {
          action: {
            label: "Error action",
            onClick: actionFn
          }
        })
      }).toThrow("Action error")

      confirmSpy.mockRestore()
    })
  })
})
