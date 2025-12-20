import { describe, expect, it, vi } from "vitest"
import { defaultToast } from "../src/lib/auth-toast"

describe("auth-toast", () => {
  describe("defaultToast", () => {
    it("should call alert when no action is provided", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

      defaultToast("Test message")

      expect(alertSpy).toHaveBeenCalledWith("Test message")
      alertSpy.mockRestore()
    })

    it("should call confirm and execute action when action is provided", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
      const actionMock = vi.fn()

      defaultToast("Confirm this action", {
        action: {
          label: "Confirm",
          onClick: actionMock
        }
      })

      expect(confirmSpy).toHaveBeenCalledWith("Confirm this action")
      expect(actionMock).toHaveBeenCalled()
      expect(alertSpy).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
      alertSpy.mockRestore()
    })

    it("should not execute action when user cancels confirm", () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)
      const actionMock = vi.fn()

      defaultToast("Confirm this action", {
        action: {
          label: "Confirm",
          onClick: actionMock
        }
      })

      expect(confirmSpy).toHaveBeenCalledWith("Confirm this action")
      expect(actionMock).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it("should handle async action onClick", async () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
      const asyncAction = vi.fn().mockResolvedValue(undefined)

      defaultToast("Async action", {
        action: {
          label: "Execute",
          onClick: asyncAction
        }
      })

      expect(confirmSpy).toHaveBeenCalledWith("Async action")
      expect(asyncAction).toHaveBeenCalled()

      await asyncAction()
      confirmSpy.mockRestore()
    })

    it("should handle undefined message", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

      defaultToast(undefined)

      expect(alertSpy).toHaveBeenCalledWith(undefined)
      alertSpy.mockRestore()
    })

    it("should return value from alert", () => {
      const alertSpy = vi.spyOn(window, "alert").mockReturnValue(undefined)

      const result = defaultToast("Test")

      expect(result).toBeUndefined()
      alertSpy.mockRestore()
    })

    it("should return value from confirm", () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      const result = defaultToast("Test", {
        action: { label: "OK", onClick: () => {} }
      })

      expect(result).toBe(true)
      confirmSpy.mockRestore()
    })
  })
})
