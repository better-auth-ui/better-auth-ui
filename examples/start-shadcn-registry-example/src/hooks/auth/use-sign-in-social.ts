import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "./use-auth"

export function useSignInSocial(config?: AnyAuthConfig) {
  const { authClient, baseURL, redirectTo, toast } = useAuth(config)

  const signInSocial = async (_: object, formData: FormData) => {
    const provider = formData.get("provider") as string

    const callbackURL = `${baseURL}${redirectTo}`

    const { error } = await authClient.signIn.social({
      provider,
      callbackURL
    })

    if (error) toast.error(error.message || error.statusText)

    return { provider }
  }

  return useActionState(signInSocial, { provider: "" })
}
