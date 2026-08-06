import {
  oneTapMutationKeys,
  promptOneTapOptions
} from "@better-auth-ui/core/plugins/one-tap"
import { describe, expect, it, vi } from "vitest"
import { oneTapPlugin } from "../src/plugins/one-tap"

describe("oneTapPlugin (Solid)", () => {
  it("registers a stable headless prompt for the selected views", () => {
    const plugin = oneTapPlugin({
      autoSelect: true,
      views: ["signIn", "signUp"]
    })

    expect(plugin.promptViews).toEqual(["signIn", "signUp"])
    expect(plugin.actionOptions).toEqual({ autoSelect: true })
    expect(plugin.authPrompts).toEqual([
      { id: "google", component: expect.any(Function) }
    ])
  })

  it("opens the prompt with a dedicated key and throwing fetch options", async () => {
    const oneTap = vi.fn(async () => undefined)
    const options = promptOneTapOptions({ oneTap } as never)

    expect(options.mutationKey).toEqual(oneTapMutationKeys.prompt)

    await expect(
      (
        options as {
          mutationFn?: (params: {
            autoSelect: boolean
            fetchOptions: { credentials: RequestCredentials }
          }) => Promise<void>
        }
      ).mutationFn?.({
        autoSelect: true,
        fetchOptions: { credentials: "include" }
      })
    ).resolves.toBeUndefined()

    expect(oneTap).toHaveBeenCalledWith({
      autoSelect: true,
      fetchOptions: { credentials: "include", throw: true }
    })
  })
})
