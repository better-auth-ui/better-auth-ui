import { describe, expect, it } from "vitest"
import {
  deviceAuthorizationLocalization,
  deviceAuthorizationMutationKeys,
  deviceAuthorizationPlugin
} from "../src/plugins"

describe("deviceAuthorizationPlugin", () => {
  it("provides a stable auth view and matching defaults", () => {
    const plugin = deviceAuthorizationPlugin()

    expect(deviceAuthorizationPlugin.id).toBe("deviceAuthorization")
    expect(plugin).toMatchObject({
      id: "deviceAuthorization",
      localization: deviceAuthorizationLocalization,
      userCodeLength: 8,
      viewPaths: {
        auth: {
          deviceAuthorization: "device"
        }
      }
    })
  })

  it("merges path, code length, and localization overrides", () => {
    const plugin = deviceAuthorizationPlugin({
      path: "activate",
      userCodeLength: 6.8,
      localization: {
        approve: "Allow"
      }
    })

    expect(plugin.viewPaths.auth.deviceAuthorization).toBe("activate")
    expect(plugin.userCodeLength).toBe(6)
    expect(plugin.localization).toMatchObject({
      approve: "Allow",
      deny: deviceAuthorizationLocalization.deny
    })
  })

  it("normalizes code length boundaries", () => {
    expect(
      deviceAuthorizationPlugin({ userCodeLength: Number.NaN }).userCodeLength
    ).toBe(8)
    expect(
      deviceAuthorizationPlugin({ userCodeLength: Number.POSITIVE_INFINITY })
        .userCodeLength
    ).toBe(8)
    expect(
      deviceAuthorizationPlugin({ userCodeLength: 0 }).userCodeLength
    ).toBe(1)
    expect(
      deviceAuthorizationPlugin({ userCodeLength: -4 }).userCodeLength
    ).toBe(1)
  })

  it("keeps mutation keys under the shared auth namespace", () => {
    expect(deviceAuthorizationMutationKeys).toEqual({
      all: ["auth", "deviceAuthorization"],
      verify: ["auth", "deviceAuthorization", "verify"],
      approve: ["auth", "deviceAuthorization", "approve"],
      deny: ["auth", "deviceAuthorization", "deny"]
    })
  })
})
