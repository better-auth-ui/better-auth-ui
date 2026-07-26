import {
  listAccountsOptions,
  useAuth,
  useAuthPlugin,
  useSession
} from "@better-auth-ui/solid"
import { createQuery } from "@tanstack/solid-query"

import { twoFactorPlugin } from "./two-factor-plugin"

/**
 * Whether two-factor management should ask for the account password.
 *
 * Better Auth's `allowPasswordless` option only waives the password for
 * accounts that have no credential account — a passkey-only user has no
 * password to type. Reading the linked accounts keeps the UI in step with
 * that rule instead of guessing from the option alone.
 */
export function useTwoFactorPasswordRequirement() {
  const auth = useAuth()
  const { allowPasswordless } = useAuthPlugin(twoFactorPlugin)
  const session = useSession(auth.authClient)

  const accounts = createQuery(() => ({
    ...listAccountsOptions(auth.authClient, session.data?.user.id),
    enabled: allowPasswordless && Boolean(session.data?.user.id)
  }))

  const hasCredentialAccount = () =>
    (accounts.data as { providerId: string }[] | undefined)?.some(
      (account) => account.providerId === "credential"
    )

  return {
    isPending: () => allowPasswordless && accounts.isPending,
    requiresPassword: () =>
      !allowPasswordless || Boolean(hasCredentialAccount())
  }
}
