import { deviceAuthorizationMutationKeys } from "@better-auth-ui/core/plugins"
import { describe, expect, it, vi } from "vitest"

import {
  approveDeviceOptions,
  denyDeviceOptions,
  verifyDeviceCodeOptions
} from "../src"

describe("device authorization mutation options", () => {
  it("uses shared keys and enables thrown Better Auth errors", async () => {
    const verify = vi.fn(async ({ query }) => ({
      status: "pending",
      user_code: query.user_code
    }))
    const approve = vi.fn(async ({ userCode }) => ({ userCode }))
    const deny = vi.fn(async ({ userCode }) => ({ userCode }))
    const device = Object.assign(verify, { approve, deny })
    const authClient = { device }

    const verifyOptions = verifyDeviceCodeOptions(authClient as never)
    const approveOptions = approveDeviceOptions(authClient as never)
    const denyOptions = denyDeviceOptions(authClient as never)

    expect(verifyOptions.mutationKey).toEqual(
      deviceAuthorizationMutationKeys.verify
    )
    expect(approveOptions.mutationKey).toEqual(
      deviceAuthorizationMutationKeys.approve
    )
    expect(denyOptions.mutationKey).toEqual(
      deviceAuthorizationMutationKeys.deny
    )

    await (
      verifyOptions as {
        mutationFn: (variables: unknown) => Promise<unknown>
      }
    ).mutationFn({
      query: { user_code: "AB12CD34" },
      fetchOptions: { credentials: "include" }
    })
    await (
      approveOptions as {
        mutationFn: (variables: unknown) => Promise<unknown>
      }
    ).mutationFn({ userCode: "AB12CD34" })
    await (
      denyOptions as {
        mutationFn: (variables: unknown) => Promise<unknown>
      }
    ).mutationFn({ userCode: "AB12CD34" })

    expect(verify).toHaveBeenCalledWith({
      query: { user_code: "AB12CD34" },
      fetchOptions: { credentials: "include", throw: true }
    })
    expect(approve).toHaveBeenCalledWith({
      userCode: "AB12CD34",
      fetchOptions: { throw: true }
    })
    expect(deny).toHaveBeenCalledWith({
      userCode: "AB12CD34",
      fetchOptions: { throw: true }
    })
  })
})
