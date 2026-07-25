import { authQueryKeys } from "@better-auth-ui/core"
import {
  adminMutationKeys,
  stopImpersonatingOptions
} from "@better-auth-ui/core/plugins/admin"
import { describe, expect, it, vi } from "vitest"

describe("admin mutation options", () => {
  it("stops impersonating with throwing fetch options and refreshes the session", async () => {
    const stopImpersonating = vi.fn(
      async (params: {
        fetchOptions: { credentials?: string; throw?: boolean }
      }) => ({
        data: params.fetchOptions
      })
    )
    const options = stopImpersonatingOptions({
      admin: { stopImpersonating }
    } as never)

    expect(options.mutationKey).toEqual(adminMutationKeys.stopImpersonating)
    expect(options.meta).toEqual({ awaits: [authQueryKeys.session] })

    await expect(
      (
        options as {
          mutationFn: (params: unknown) => Promise<unknown>
        }
      ).mutationFn({
        fetchOptions: { credentials: "include" }
      })
    ).resolves.toEqual({
      data: { credentials: "include", throw: true }
    })
    expect(stopImpersonating).toHaveBeenCalledWith({
      fetchOptions: { credentials: "include", throw: true }
    })
  })
})
