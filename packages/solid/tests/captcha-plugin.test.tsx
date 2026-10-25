import { renderToString } from "solid-js/web"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider, useFetchOptions } from "../src"
import { type CaptchaRenderProps, captchaPlugin } from "../src/plugins/captcha"

function FetchOptionsConsumer() {
  const { fetchOptions, setFetchOptions, registerReset, resetFetchOptions } =
    useFetchOptions()
  const reset = vi.fn()

  setFetchOptions({ headers: { "x-captcha-response": "token-1" } })
  registerReset(reset)
  resetFetchOptions()

  return `${fetchOptions()?.headers?.["x-captcha-response"] ?? "cleared"}:$${
    reset.mock.calls.length
  }`
}

describe("Solid captcha plugin", () => {
  it("provides fetch options state and reset callbacks through AuthProvider", () => {
    const authClient = { getSession: vi.fn() }

    expect(
      renderToString(() => (
        <AuthProvider authClient={authClient as never}>
          {() => <FetchOptionsConsumer />}
        </AuthProvider>
      ))
    ).toContain("cleared:$1")
  })

  it("sets the captcha response header from render props", () => {
    const authClient = { getSession: vi.fn() }
    const plugin = captchaPlugin({
      render: (props: CaptchaRenderProps) => {
        props.setToken("token-1")

        return null
      }
    })
    const Captcha = plugin.captchaComponent

    function CaptchaState() {
      const { fetchOptions } = useFetchOptions()

      return fetchOptions()?.headers?.["x-captcha-response"] ?? "missing"
    }

    expect(
      renderToString(() => (
        <AuthProvider authClient={authClient as never} plugins={[plugin]}>
          {() => (
            <>
              <Captcha />
              <CaptchaState />
            </>
          )}
        </AuthProvider>
      ))
    ).toContain("token-1")
  })

  it("clears captcha tokens and invokes registered widget reset callbacks", () => {
    const authClient = { getSession: vi.fn() }
    const reset = vi.fn()
    const plugin = captchaPlugin({
      render: (props: CaptchaRenderProps) => {
        props.setToken("token-1")
        props.setReset(reset)
        props.clearToken()

        return null
      }
    })
    const Captcha = plugin.captchaComponent

    function ResetState() {
      const { fetchOptions, resetFetchOptions } = useFetchOptions()

      resetFetchOptions()

      return `${fetchOptions()?.headers?.["x-captcha-response"] ?? "cleared"}:$${
        reset.mock.calls.length
      }`
    }

    expect(
      renderToString(() => (
        <AuthProvider authClient={authClient as never} plugins={[plugin]}>
          {() => (
            <>
              <Captcha />
              <ResetState />
            </>
          )}
        </AuthProvider>
      ))
    ).toContain("cleared:$1")
  })
})

it("preserves custom fetch options when CAPTCHA tokens rotate, expire, and reset", () => {
  const reset = vi.fn()
  const customOptions = {
    headers: { "x-tenant": "acme" },
    body: { tenant: "acme" }
  }
  let controls!: CaptchaRenderProps
  let options!: ReturnType<typeof useFetchOptions>
  const plugin = captchaPlugin({
    render: (props) => {
      controls = props
      props.setReset(reset)
      return null
    }
  })
  const Captcha = plugin.captchaComponent
  function CheckTokens() {
    controls.setToken("first")
    expect(options.fetchOptions()).toEqual({
      ...customOptions,
      headers: { ...customOptions.headers, "x-captcha-response": "first" }
    })
    options.resetCaptcha()
    expect(options.fetchOptions()).toEqual(customOptions)
    expect(reset).toHaveBeenCalledOnce()
    controls.setToken("second")
    controls.clearToken()
    expect(options.fetchOptions()).toEqual(customOptions)
    return null
  }
  renderToString(() => (
    <AuthProvider
      authClient={{ getSession: vi.fn() } as never}
      plugins={[plugin]}
    >
      {() => {
        options = useFetchOptions()
        options.setFetchOptions(customOptions)
        return (
          <>
            <Captcha />
            <CheckTokens />
          </>
        )
      }}
    </AuthProvider>
  ))
})
