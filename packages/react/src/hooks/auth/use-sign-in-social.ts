import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "./use-auth"
import { useRedirectTo } from "./use-redirect-to"

export function useSignInSocial(config?: AnyAuthConfig) {
  const { authClient, baseURL, toast } = useAuth(config)
  const redirectTo = useRedirectTo(config)

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
