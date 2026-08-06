import { lastLoginMethodPlugin } from "@better-auth-ui/core/plugins/last-login-method"
import { renderHook } from "@testing-library/react"
import type { PropsWithChildren } from "react"
import { describe, expect, it, vi } from "vitest"

import {
  AuthProvider,
  type AuthProviderProps,
  useLastLoginMethod
} from "../../src"

function createWrapper(
  authClient: AuthProviderProps["authClient"],
  enabled = true
) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <AuthProvider
        authClient={authClient}
        navigate={() => {}}
        plugins={enabled ? [lastLoginMethodPlugin()] : []}
      >
        {children}
      </AuthProvider>
    )
  }
}

describe("useLastLoginMethod", () => {
  it("reads the client method when the UI plugin is registered", () => {
    const getLastUsedLoginMethod = vi.fn(() => "github")
    const authClient = {
      getLastUsedLoginMethod
    } as unknown as AuthProviderProps["authClient"]

    const { result } = renderHook(() => useLastLoginMethod(), {
      wrapper: createWrapper(authClient)
    })

    expect(result.current.method).toBe("github")
    expect(getLastUsedLoginMethod).toHaveBeenCalled()
  })

  it("does not read the client method without the UI plugin", () => {
    const getLastUsedLoginMethod = vi.fn(() => "github")
    const authClient = {
      getLastUsedLoginMethod
    } as unknown as AuthProviderProps["authClient"]

    const { result } = renderHook(() => useLastLoginMethod(), {
      wrapper: createWrapper(authClient, false)
    })

    expect(result.current.method).toBeNull()
    expect(getLastUsedLoginMethod).not.toHaveBeenCalled()
  })
})
