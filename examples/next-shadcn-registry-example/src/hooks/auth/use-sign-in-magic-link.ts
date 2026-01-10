import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "./use-auth"

export function useSignInMagicLink(config?: AnyAuthConfig) {
  const { authClient, baseURL, localization, redirectTo, toast } =
    useAuth(config)

  const signInMagicLink = async (_: object, formData: FormData) => {
    const email = formData.get("email") as string

    const callbackURL = `${baseURL}${redirectTo}`

    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL
    })

    if (error) {
      toast.error(error.message || error.statusText)

      return { email }
    }

    toast.success(localization.auth.magicLinkSent)

    return { email: "" }
  }

  return useActionState(signInMagicLink, { email: "" })
}
