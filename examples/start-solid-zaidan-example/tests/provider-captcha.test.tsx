import { AuthProvider, useFetchOptions } from "@better-auth-ui/solid"
import { QueryClient } from "@tanstack/solid-query"
import { renderToString } from "solid-js/web"
import { describe, expect, it, vi } from "vitest"
import { ProviderButton } from "../src/components/auth/provider-button"

const button = vi.hoisted(() => ({ click: () => {} }))
vi.mock("@/components/ui/button", () => ({
  Button: (props: { onClick: () => void }) => {
    button.click = props.onClick
    return null
  }
}))

function setup(mode: "redirect" | "popup" = "redirect") {
  const social = vi
    .fn<
      (params: {
        fetchOptions: { headers: Record<string, string> }
      }) => Promise<{ data: object; error: null }>
    >()
    .mockRejectedValueOnce(new Error("Invalid CAPTCHA"))
    .mockResolvedValue({ data: {}, error: null })
  const popup = vi.fn<(...args: unknown[]) => unknown>().mockResolvedValue({
    error: { code: "POPUP_CLOSED", message: "Popup closed" }
  })
  const authClient = {
    signIn: { social, popup },
    getSession: vi.fn<() => Promise<null>>(async () => null)
  }
  const reset = vi.fn<(...args: unknown[]) => unknown>()
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
    button.click()
    await vi.waitFor(() => expect(reset).toHaveBeenCalledOnce())
    expect(social).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "github",
        fetchOptions: {
          headers: { "x-captcha-response": "first-token" },
          throw: true
        }
      })
    )
    expect(options.fetchOptions()).toBeUndefined()
    options.setFetchOptions({
      headers: { "x-captcha-response": "second-token" }
    })
    button.click()
    await vi.waitFor(() => expect(social).toHaveBeenCalledTimes(2))
    expect(
      social.mock.calls[1][0].fetchOptions.headers["x-captcha-response"]
    ).toBe("second-token")
    expect(reset).toHaveBeenCalledOnce()
  })

  it("resets popup failures without forwarding unsupported fetch options", async () => {
    const { popup, reset, options } = setup("popup")
    button.click()
    await vi.waitFor(() => expect(reset).toHaveBeenCalledOnce())
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
