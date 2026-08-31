import { AuthProvider, useFetchOptions } from "@better-auth-ui/solid"
import { QueryClient } from "@tanstack/solid-query"
import { renderToString } from "solid-js/web"
import { describe, expect, it, vi } from "vitest"
import { ProviderButton } from "../src/components/auth/provider-button"

const button = vi.hoisted(() => ({ click: async () => {} }))
vi.mock("@/components/ui/button", () => ({
  Button: (props: { onClick: () => Promise<void> }) => {
    button.click = props.onClick
    return null
  }
}))

function setup(mode: "redirect" | "popup" = "redirect") {
  const social = vi
    .fn()
    .mockRejectedValueOnce(new Error("Invalid CAPTCHA"))
    .mockResolvedValue({ data: {}, error: null })
  const popup = vi.fn().mockResolvedValue({
    error: { code: "POPUP_CLOSED", message: "Popup closed" }
  })
  const authClient = {
    signIn: { social, popup },
    getSession: vi.fn(async () => null)
  }
  const reset = vi.fn()
  let options!: ReturnType<typeof useFetchOptions>
  renderToString(() => (
    <AuthProvider
      authClient={authClient as never}
      socialSignInMode={mode}
      redirectTo="/dashboard"
      queryClient={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      {() => {
        options = useFetchOptions()
        options.registerReset(reset)
        options.setFetchOptions({
          headers: { "x-captcha-response": "first-token" }
        })
        return <ProviderButton provider="github" />
      }}
    </AuthProvider>
  ))
  return { social, popup, reset, options }
}

describe("Solid provider CAPTCHA", () => {
  it("forwards tokens and clears failures before retrying with a fresh token", async () => {
    const { social, reset, options } = setup()
    await button.click()
    expect(social).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "github",
        fetchOptions: {
          headers: { "x-captcha-response": "first-token" },
          throw: true
        }
      })
    )
    expect(reset).toHaveBeenCalledOnce()
    expect(options.fetchOptions()).toBeUndefined()
    options.setFetchOptions({
      headers: { "x-captcha-response": "second-token" }
    })
    await button.click()
    expect(
      social.mock.calls[1][0].fetchOptions.headers["x-captcha-response"]
    ).toBe("second-token")
    expect(reset).toHaveBeenCalledOnce()
  })

  it("resets popup failures without forwarding unsupported fetch options", async () => {
    const { popup, reset, options } = setup("popup")
    await button.click()
    expect(popup).toHaveBeenCalledWith({
      provider: "github",
      callbackURL: "/dashboard",
      requestSignUp: false,
      errorCallbackURL: "/auth/sign-in"
    })
    expect(reset).toHaveBeenCalledOnce()
    expect(options.fetchOptions()).toBeUndefined()
  })
})
