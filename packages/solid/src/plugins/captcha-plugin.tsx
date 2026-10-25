import { createAuthPlugin } from "@better-auth-ui/core"
import { type Component, onCleanup } from "solid-js"
import { useFetchOptions } from "../lib/fetch-options-provider"

/** Props passed to the consumer's `render` component. */
export type CaptchaRenderProps = {
  /** Call once the user solves the captcha. */
  setToken: (token: string) => void
  /** Call on error/expire to clear the token. */
  clearToken: () => void
  /**
   * Register your widget's `reset()`. Forms call it after a failed
   * submission since captcha tokens are single-use. Pass `null` on cleanup.
   */
  setReset: (reset: (() => void) | null) => void
}

export type CaptchaPluginOptions = {
  /** Renders the captcha widget. Wire `setToken`, `clearToken`, and `setReset`. */
  render: Component<CaptchaRenderProps>
}

/**
 * Provider-agnostic captcha plugin. Forwards the resolved token via the
 * `x-captcha-response` header on Better Auth requests.
 */
export const captchaPlugin = createAuthPlugin(
  "captcha",
  ({ render: Render }: CaptchaPluginOptions) => {
    const CaptchaWidget = () => {
      const { setCaptchaToken, registerReset } = useFetchOptions()

      const setToken = (token: string) => {
        setCaptchaToken(token)
      }

      const clearToken = () => {
        setCaptchaToken(undefined)
      }

      const setReset = (reset: (() => void) | null) => {
        registerReset(reset)
      }

      onCleanup(() => {
        setCaptchaToken(undefined)
        registerReset(null)
      })

      return (
        <Render
          setToken={setToken}
          clearToken={clearToken}
          setReset={setReset}
        />
      )
    }

    return {
      render: Render,
      captchaComponent: CaptchaWidget
    }
  }
)
