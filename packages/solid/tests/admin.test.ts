import { authQueryKeys } from "@better-auth-ui/core"
import { adminMutationKeys } from "@better-auth-ui/core/plugins"
import { describe, expect, it, vi } from "vitest"

import { stopImpersonatingOptions } from "../src"

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
