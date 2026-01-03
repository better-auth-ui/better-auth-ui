import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "./use-auth"
import { useRedirectTo } from "./use-redirect-to"

export function useSignUpEmail(config?: AnyAuthConfig) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    queryClient,
    toast,
    viewPaths,
    navigate
  } = useAuth(config)

  const redirectTo = useRedirectTo(config)

  const signUpEmail = async (_: object, formData: FormData) => {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validate confirmPassword if enabled
    if (emailAndPassword?.confirmPassword) {
      if (password !== confirmPassword) {
        toast.error(localization.auth.passwordsDoNotMatch)

        return {
          name,
          email,
          password: "",
          confirmPassword: ""
        }
      }
    }

    const { error } = await authClient.signUp.email({
      name,
      email,
      password
    })

    if (error) {
      toast.error(error.message || error.statusText)

      return {
        name,
        email,
        password: "",
        confirmPassword: ""
      }
    }

    if (emailAndPassword?.requireEmailVerification) {
      toast.success(localization.auth.verifyYourEmail)
      navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)
    } else {
      await queryClient.invalidateQueries({ queryKey: ["auth"] })

      navigate(redirectTo)
    }

    return {
      name,
      email,
      password,
      confirmPassword
    }
  }

  return useActionState(signUpEmail, {
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
}
