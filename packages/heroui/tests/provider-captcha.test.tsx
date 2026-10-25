import { captchaPlugin } from "@better-auth-ui/react/plugins/captcha"
import { useFetchOptions } from "@better-auth-ui/react"
import { QueryClient } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useEffect, useRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { EmailOtp } from "../src/components/auth/email-otp/email-otp"
import { emailOtpPlugin } from "../src/lib/auth/email-otp-plugin"
import { ProviderButton } from "../src/components/auth/provider-button"

function CaptchaControls({ reset }: { reset: () => void }) {
  const { fetchOptions, setFetchOptions, registerReset } = useFetchOptions()
  const sequence = useRef(0)
  useEffect(() => {
    registerReset(reset)
    return () => registerReset(null)
  }, [registerReset, reset])
  return (
    <>
      <button
        type="button"
        onClick={() =>
          setFetchOptions({
            headers: { "x-captcha-response": `token-${++sequence.current}` },
            body: { tenant: "acme" }
          })
        }
      >
        Solve CAPTCHA
      </button>
      <output aria-label="CAPTCHA token">
        {fetchOptions?.headers?.["x-captcha-response"] ?? "empty"}
      </output>
    </>
  )
}

function setup(mode: "redirect" | "popup" = "redirect") {
  const social = vi
    .fn()
    .mockRejectedValueOnce(new Error("Invalid CAPTCHA"))
    .mockResolvedValue({ data: {}, error: null })
  const popup = vi.fn().mockResolvedValue({
    error: { message: "Popup closed", code: "POPUP_CLOSED" }
  })
  const reset = vi.fn()
  const authClient = {
    signIn: { social, popup },
    useSession: () => ({ data: null, error: null, isPending: false })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  render(
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      socialSignInMode={mode}
      redirectTo="/dashboard"
      queryClient={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      <CaptchaControls reset={reset} />
      <ProviderButton provider="github" />
    </AuthProvider>
  )
  return { social, popup, reset }
}

describe("provider CAPTCHA", () => {
  it("forwards current fetch options, clears failed tokens, and uses a fresh token on retry", async () => {
    const { social, reset } = setup()
    fireEvent.click(screen.getByRole("button", { name: "Solve CAPTCHA" }))
    const signIn = screen.getByRole("button", { name: /continue with github/i })
    fireEvent.click(signIn)
    await waitFor(() => expect(reset).toHaveBeenCalledOnce())
    expect(social).toHaveBeenCalledWith({
      provider: "github",
      callbackURL: "/dashboard",
      fetchOptions: {
        headers: { "x-captcha-response": "token-1" },
        body: { tenant: "acme" },
        throw: true
      }
    })
    expect(screen.getByLabelText("CAPTCHA token")).toHaveTextContent("empty")
    fireEvent.click(screen.getByRole("button", { name: "Solve CAPTCHA" }))
    fireEvent.click(signIn)
    await waitFor(() => expect(social).toHaveBeenCalledTimes(2))
    expect(
      social.mock.calls[1][0].fetchOptions.headers["x-captcha-response"]
    ).toBe("token-2")
    expect(reset).toHaveBeenCalledOnce()
  })

  it("resets on popup failure without passing unsupported fetch options", async () => {
    const { popup, social, reset } = setup("popup")
    fireEvent.click(screen.getByRole("button", { name: "Solve CAPTCHA" }))
    fireEvent.click(
      screen.getByRole("button", { name: /continue with github/i })
    )
    await waitFor(() => expect(reset).toHaveBeenCalledOnce())
    expect(popup).toHaveBeenCalledWith({
      provider: "github",
      callbackURL: "/dashboard",
      requestSignUp: false
    })
    expect(social).not.toHaveBeenCalled()
    expect(screen.getByLabelText("CAPTCHA token")).toHaveTextContent("empty")
  })
})

it("forwards a fresh CAPTCHA token for each email-code sign-in step", async () => {
  const reset = vi.fn()
  const sendCode = vi.fn(async () => ({ success: true }))
  const signIn = vi.fn(async () => ({ token: "session" }))
  const navigate = vi.fn()
  const authClient = {
    getSession: async () => null,
    emailOtp: { sendVerificationOtp: sendCode },
    signIn: { emailOtp: signIn }
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  render(
    <AuthProvider
      authClient={authClient}
      navigate={navigate}
      plugins={[
        emailOtpPlugin(),
        captchaPlugin({ render: () => <CaptchaControls reset={reset} /> })
      ]}
      queryClient={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      <EmailOtp />
    </AuthProvider>
  )
  fireEvent.click(screen.getByRole("button", { name: "Solve CAPTCHA" }))
  fireEvent.change(screen.getByLabelText(/^email$/i), {
    target: { value: "user@example.com" }
  })
  fireEvent.click(screen.getByRole("button", { name: /^send code$/i }))
  await waitFor(() =>
    expect(sendCode).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchOptions: expect.objectContaining({
          headers: { "x-captcha-response": "token-1" }
        })
      })
    )
  )
  await waitFor(() => expect(reset).toHaveBeenCalledOnce())
  fireEvent.click(screen.getByRole("button", { name: "Solve CAPTCHA" }))
  const codeInput = screen
    .getAllByRole("textbox")
    .find((element) => !(element as HTMLInputElement).readOnly)
  if (!codeInput) throw new Error("Missing code input")
  fireEvent.change(codeInput, { target: { value: "123456" } })
  fireEvent.click(screen.getByRole("button", { name: /^verify code$/i }))
  await waitFor(() =>
    expect(signIn).toHaveBeenCalledWith(
      expect.objectContaining({
        otp: "123456",
        fetchOptions: expect.objectContaining({
          headers: { "x-captcha-response": "token-2" }
        })
      })
    )
  )
  await waitFor(() => expect(navigate).toHaveBeenCalled())
})
