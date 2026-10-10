import {
  isTwoFactorRedirect,
  parseTwoFactorMethods
} from "@better-auth-ui/core/plugins/two-factor"
import { useAuth } from "@better-auth-ui/react"
import { useNativeReauthentication } from "../../components/auth/reauthentication"
import { useAuthNavigation } from "../../navigation/navigation-context"

/** Complete sign-in only after the server has established a session. */
export function useSignInContinuation() {
  const { redirectTo, plugins } = useAuth()
  const navigation = useAuthNavigation()
  const recovery = useNativeReauthentication()
  return async (data: unknown) => {
    if (isTwoFactorRedirect(data)) {
      if (!plugins.some((plugin) => plugin.id === "twoFactor")) {
        throw new Error(
          "Register twoFactorPlugin() to complete the authentication challenge."
        )
      }
      navigation.push("twoFactor", {
        params: {
          methods: parseTwoFactorMethods(data.twoFactorMethods).join(","),
          redirectTo
        }
      })
      return
    }
    if (!(await recovery.complete())) navigation.navigate({ to: redirectTo })
  }
}
