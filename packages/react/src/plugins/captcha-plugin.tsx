"use client"

import { createAuthPlugin } from "@better-auth-ui/core"
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect
} from "react"
import { useFetchOptions } from "../components/auth/fetch-options-provider"
import { useAuthPlugin } from "../hooks/use-auth-plugin"

/** Props passed to the consumer's `render` component. */
export type CaptchaRenderProps = {
  /** Call once the user solves the captcha. */
  setToken: (token: string) => void
  /** Call on error/expire to clear the token. */
  clearToken: () => void
  /**
   * Register your widget's `reset()`. Forms call it after a failed
   * submission since captcha tokens are single-use. Pass `null` on unmount.
   */
  setReset: (reset: (() => void) | null) => void
}

export type CaptchaPluginOptions = {
  /** Renders the captcha widget. Wire `setToken`, `clearToken`, `setReset`. */
  render: ComponentType<CaptchaRenderProps>
}

function CaptchaWidget(): ReactNode {
  const { render: Render } = useAuthPlugin(captchaPlugin)
  const { setCaptchaToken, registerReset } = useFetchOptions()

  const setToken = useCallback(
    (token: string) => {
      setCaptchaToken(token)
    },
    [setCaptchaToken]
  )

  const clearToken = useCallback(() => {
    setCaptchaToken(undefined)
  }, [setCaptchaToken])

  const setReset = useCallback(
    (reset: (() => void) | null) => {
      registerReset(reset)
    },
    [registerReset]
  )

  useEffect(() => {
    return () => {
      setCaptchaToken(undefined)
      registerReset(null)
    }
  }, [setCaptchaToken, registerReset])

  return (
    <Render setToken={setToken} clearToken={clearToken} setReset={setReset} />
  )
}

/**
 * Provider-agnostic captcha plugin. Forwards the resolved token via the
 * `x-captcha-response` header on Better Auth requests.
 */
export const captchaPlugin = createAuthPlugin(
  "captcha",
  ({ render }: CaptchaPluginOptions) => ({
    render,
    captchaComponent: <CaptchaWidget />
  })
)
