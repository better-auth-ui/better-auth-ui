import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "./use-auth"
import { useRedirectTo } from "./use-redirect-to"

export function useSignInEmail(config?: AnyAuthConfig) {
  const {
    authClient,
    baseURL,
    emailAndPassword,
    localization,
    queryClient,
    toast,
    navigate
  } = useAuth(config)

  const redirectTo = useRedirectTo(config)

  const signInEmail = async (_: object, formData: FormData) => {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const rememberMe = formData.get("rememberMe") === "on"

    const { error } = await authClient.signIn.email({
      email,
      password,
      ...(emailAndPassword?.rememberMe ? { rememberMe } : {})
    })

    if (error) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        const toastId = toast.error(error.message || error.statusText, {
          action: {
            label: localization.auth.resend,
            onClick: async () => {
              const callbackURL = `${baseURL}${redirectTo}`

              toast.dismiss?.(toastId)

              const { error } = await authClient.sendVerificationEmail({
                email,
                callbackURL
              })

              if (error) {
                toast.error(error.message || error.statusText)
              } else {
                toast.success(localization.auth.verificationEmailSent)
              }
            }
          }
        })
      } else {
        toast.error(error.message || error.statusText)
      }

      return {
        email,
        password: ""
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["auth"] })

    navigate(redirectTo)

    return { email, password }
  }

  return useActionState(signInEmail, {
    email: "",
    password: ""
  })
}
