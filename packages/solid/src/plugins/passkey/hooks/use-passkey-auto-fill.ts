import {
  isConditionalMediationAvailable,
  isPasskeyAutoFillEnabled,
  type PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import { onCleanup, onMount } from "solid-js"
import { useAuth } from "../../../lib/auth-provider"
import {
  type UseSignInPasskeyOptions,
  useSignInPasskey
} from "./mutations/use-sign-in-passkey"

export type UsePasskeyAutoFillOptions<TAuthClient extends PasskeyAuthClient> = {
  /**
   * Skip the conditional request on views where passkey sign-in doesn't
   * apply, such as sign-up.
   * @default true
   */
  enabled?: boolean
  /** Solid Query options forwarded to the sign-in mutation. */
  mutation?: UseSignInPasskeyOptions<TAuthClient>
}

/**
 * Offer the user's passkeys through the browser's autofill dropdown (WebAuthn
 * conditional UI) for as long as the calling component is mounted.
 *
 * Does nothing when the passkey plugin isn't registered, when its `autoFill`
 * option is off, or when the browser can't service a conditionally mediated
 * request. Pair it with the `webauthn` autocomplete token on the identifier
 * field — see `withPasskeyAutoFill` in `@better-auth-ui/core/plugins/passkey`.
 *
 * The request stays open until the user picks a passkey or the page
 * navigates. WebAuthn gives us no way to withdraw it, so cleanup only stops a
 * pending availability probe from starting one.
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param options - Enablement flag and mutation options.
 */
export function usePasskeyAutoFill<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: UsePasskeyAutoFillOptions<TAuthClient>
) {
  const auth = useAuth()
  const signInPasskey = useSignInPasskey(authClient, options?.mutation)

  onMount(() => {
    if (options?.enabled === false || !isPasskeyAutoFillEnabled(auth.plugins)) {
      return
    }

    let cancelled = false

    void isConditionalMediationAvailable().then((available) => {
      if (!available || cancelled) return

      signInPasskey.mutate({ autoFill: true })
    })

    onCleanup(() => {
      cancelled = true
    })
  })
}
