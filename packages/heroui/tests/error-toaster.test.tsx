import {
  authMutationKeys,
  authQueryKeys,
  localization
} from "@better-auth-ui/core"
import { toast } from "@heroui/react"
import { MutationCache, QueryClient } from "@tanstack/react-query"
import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../src/components/auth/auth-provider"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function setup() {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
  const previousOnError = vi.fn()
  const client = new QueryClient({
    mutationCache: new MutationCache({ onError: previousOnError })
  })
  const danger = vi.spyOn(toast, "danger").mockReturnValue("test")
  render(
    <AuthProvider
      authClient={{} as never}
      queryClient={client}
      navigate={() => {}}
    />
  )
  const fail = async (
    error: unknown,
    meta?: Record<string, unknown>,
    mutationKey: readonly string[] = authMutationKeys.signIn.popup
  ) => {
    const mutation = client.getMutationCache().build(client, {
      mutationKey,
      meta,
      mutationFn: async () => {
        throw error
      }
    })
    await expect(mutation.execute(undefined)).rejects.toBe(error)
  }
  return { client, danger, previousOnError, fail, consoleError }
}

describe("error toaster cache integration", () => {
  it("keeps cancellation silent without skipping the host callback", async () => {
    const { client, danger, previousOnError, fail, consoleError } = setup()
    await fail({ code: "POPUP_CLOSED" })
    expect(danger).not.toHaveBeenCalled()
    expect(previousOnError).toHaveBeenCalledOnce()
    expect(consoleError).not.toHaveBeenCalled()
    const error = { code: "POPUP_BLOCKED" }
    await fail(error)
    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      expect.any(String),
      error
    )
    expect(danger).toHaveBeenCalledExactlyOnceWith(
      localization.errors.popupBlocked
    )
    client.clear()
  })

  it("respects inline and silent errors and only displays safe fallback copy", async () => {
    const { client, danger, fail, consoleError } = setup()
    const error = new Error("internal details")
    await fail(error, { errorPresentation: "inline" })
    await fail(error, { errorPresentation: "silent" })
    await fail(error, undefined, ["unrelated"])
    expect(danger).not.toHaveBeenCalled()
    expect(consoleError).not.toHaveBeenCalled()
    await fail(error)
    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      expect.any(String),
      error
    )
    expect(danger).toHaveBeenCalledExactlyOnceWith(localization.errors.generic)
    client.clear()
  })

  it("uses safe copy for query errors without a Better Fetch wrapper", async () => {
    const { client, danger, consoleError } = setup()
    const error = new Error("internal details")
    await expect(
      client.fetchQuery({
        queryKey: authQueryKeys.session,
        retry: false,
        queryFn: async () => {
          throw error
        }
      })
    ).rejects.toBe(error)
    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      expect.any(String),
      error
    )
    expect(danger).toHaveBeenCalledExactlyOnceWith(localization.errors.generic)
    client.clear()
  })
})
