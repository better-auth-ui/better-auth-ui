import type { CaptchaFoxInstance } from "@captchafox/react"
import type HCaptcha from "@hcaptcha/react-hcaptcha"
import type { TurnstileInstance } from "@marsidev/react-turnstile"
import { useGoogleReCaptcha } from "@wojtekmaj/react-recaptcha-v3"
import { type RefObject, useContext, useRef } from "react"
import type ReCAPTCHA from "react-google-recaptcha"

import { AuthUIContext } from "../lib/auth-ui-provider"
import type { AuthLocalization } from "../localization/auth-localization"

// Default captcha endpoints
const DEFAULT_CAPTCHA_ENDPOINTS = [
    "/sign-up/email",
    "/sign-in/email",
    "/forget-password"
]

// Sanitize action name for reCAPTCHA
// Google reCAPTCHA only allows A-Za-z/_ in action names
const sanitizeActionName = (action: string): string => {
    // First remove leading slash if present
    let result = action.startsWith("/") ? action.substring(1) : action

    // Convert both kebab-case and path separators to camelCase
    // Example: "/sign-in/email" becomes "signInEmail"
    result = result
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/\/([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/\//g, "")
        .replace(/[^A-Za-z0-9_]/g, "")

    return result
}

export function useCaptcha({
    localization
}: {
    localization: Partial<AuthLocalization>
}) {
    const { captcha, localization: contextLocalization } =
        useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    // biome-ignore lint/suspicious/noExplicitAny: ignore
    const captchaRef = useRef<any>(null)
    const { executeRecaptcha } = useGoogleReCaptcha()

    const executeCaptcha = async (action: string) => {
        if (!captcha) throw new Error(localization.MISSING_RESPONSE)

        // Sanitize the action name for reCAPTCHA
        let response: string | undefined | null

        switch (captcha.provider) {
            case "google-recaptcha-v3": {
                const sanitizedAction = sanitizeActionName(action)
                response = await executeRecaptcha?.(sanitizedAction)
                break
            }
            case "google-recaptcha-v2-checkbox": {
                const recaptchaRef = captchaRef as RefObject<ReCAPTCHA>
                response = recaptchaRef.current.getValue()
                break
            }
            case "google-recaptcha-v2-invisible": {
                const recaptchaRef = captchaRef as RefObject<ReCAPTCHA>
                response = await recaptchaRef.current.executeAsync()
                break
            }
            case "cloudflare-turnstile": {
                const turnstileRef = captchaRef as RefObject<TurnstileInstance>
                response = turnstileRef.current.getResponse()
                break
            }
            case "hcaptcha": {
                const hcaptchaRef = captchaRef as RefObject<HCaptcha>
                response = hcaptchaRef.current.getResponse()
                break
            }
            case "captchafox": {
                const captchafoxRef =
                    captchaRef as RefObject<CaptchaFoxInstance>
                response = captchafoxRef.current.getResponse()
                break
            }
        }

        if (!response) {
            throw new Error(localization.MISSING_RESPONSE)
        }

        return response
    }

    const getCaptchaHeaders = async (action: string) => {
        if (!captcha) return undefined

        // Use custom endpoints if provided, otherwise use defaults
        const endpoints = captcha.endpoints || DEFAULT_CAPTCHA_ENDPOINTS

        // Only execute captcha if the action is in the endpoints list
        if (endpoints.includes(action)) {
            return { "x-captcha-response": await executeCaptcha(action) }
        }

        return undefined
    }

    const resetCaptcha = () => {
        if (!captcha) return

        switch (captcha.provider) {
            case "google-recaptcha-v3": {
                // No widget to reset; token is generated per execute call
                break
            }
            case "google-recaptcha-v2-checkbox":
            case "google-recaptcha-v2-invisible": {
                const recaptchaRef = captchaRef as RefObject<ReCAPTCHA>
                recaptchaRef.current?.reset?.()
                break
            }
            case "cloudflare-turnstile": {
                const turnstileRef = captchaRef as RefObject<TurnstileInstance>
                // Some versions expose reset on the instance
                // biome-ignore lint/suspicious/noExplicitAny: defensive
                ;(turnstileRef.current as any)?.reset?.()
                break
            }
            case "hcaptcha": {
                const hcaptchaRef = captchaRef as RefObject<HCaptcha>
                // HCaptcha uses resetCaptcha()
                hcaptchaRef.current?.resetCaptcha?.()
                break
            }
            case "captchafox": {
                const captchafoxRef =
                    captchaRef as RefObject<CaptchaFoxInstance>
                captchafoxRef.current?.reset?.()
                break
            }
        }
    }

    return {
        captchaRef,
        getCaptchaHeaders,
        resetCaptcha
    }
}
