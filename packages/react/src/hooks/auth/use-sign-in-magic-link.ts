import { useAuth } from "@better-auth-ui/react"
import { useActionState } from "react"

export function useSignInMagicLink() {
  const { authClient, baseURL, localization, redirectTo, toast } = useAuth()

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
