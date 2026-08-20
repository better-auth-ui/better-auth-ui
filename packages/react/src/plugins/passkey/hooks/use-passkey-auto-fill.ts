"use client"

import {
  isConditionalMediationAvailable,
  isPasskeyAutoFillEnabled,
  type PasskeyAuthClient,
  type SignInPasskeyOptions
} from "@better-auth-ui/core/plugins/passkey"
import { useEffect, useRef } from "react"
import { useAuth } from "../../../components/auth/auth-provider"
import { useSignInPasskey } from "./mutations/use-sign-in-passkey"

export type UsePasskeyAutoFillOptions<TAuthClient extends PasskeyAuthClient> =
  SignInPasskeyOptions<TAuthClient> & {
    /**
     * Skip the conditional request on views where passkey sign-in doesn't
     * apply, such as sign-up.
     * @default true
     */
    enabled?: boolean
  }

/**
 * Offer the user's passkeys through the browser's autofill dropdown (WebAuthn
 * conditional UI) for as long as the calling component is mounted.
 *
 * Does nothing when the passkey plugin isn't registered, when its `autoFill`
 * option is off, or when the browser can't service a conditionally mediated
 * request. Pair it with the `webauthn` autocomplete token on the identifier
 * field. See `withPasskeyAutoFill` in `@better-auth-ui/core/plugins/passkey`.
 *
 * The request stays open until the user picks a passkey or the page
 * navigates. The Better Auth passkey client doesn't expose WebAuthn's abort
 * signal, so unmounting only stops a pending availability probe from starting
 * one.
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param options - React Query options forwarded to the sign-in mutation.
 */
export function usePasskeyAutoFill<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: UsePasskeyAutoFillOptions<TAuthClient>
) {
  const { plugins } = useAuth()
  const { enabled = true, ...mutationOptions } = options ?? {}
  const { mutate: signInPasskey } = useSignInPasskey(
    authClient,
    mutationOptions
  )
  const started = useRef(false)

  const active = enabled && isPasskeyAutoFillEnabled(plugins)

  useEffect(() => {
    if (started.current || !active) return

    let cancelled = false

    void isConditionalMediationAvailable().then((available) => {
      if (!available || cancelled) return

      started.current = true
      signInPasskey({ autoFill: true })
    })

    return () => {
      cancelled = true
    }
  }, [active, signInPasskey])
}
