import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "./use-auth"

export function useResetPassword(config?: AnyAuthConfig) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    toast,
    viewPaths,
    navigate
  } = useAuth(config)

  const resetPassword = async (_: object, formData: FormData) => {
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get("token")

    if (!token) {
      toast.error(localization.auth.invalidResetPasswordToken)
      navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)

      return {
        password: "",
        ...(emailAndPassword?.confirmPassword ? { confirmPassword: "" } : {})
      }
    }

    // Validate confirmPassword if enabled
    if (emailAndPassword?.confirmPassword) {
      if (password !== confirmPassword) {
        toast.error(localization.auth.passwordsDoNotMatch)

        return {
          password: "",
          confirmPassword: ""
        }
      }
    }

    const { error } = await authClient.resetPassword({
      token,
      newPassword: password
    })

    if (error) {
      toast.error(error.message || error.statusText)

      return {
        password: "",
        confirmPassword: ""
      }
    }

    toast.success(localization.auth.passwordResetSuccess)
    navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)

    return {
      password,
      confirmPassword
    }
  }

  return useActionState(resetPassword, {
    password: "",
    confirmPassword: ""
  })
}
