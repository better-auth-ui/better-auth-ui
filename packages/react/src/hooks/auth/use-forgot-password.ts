import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "./use-auth"

export function useForgotPassword(config?: AnyAuthConfig) {
  const { authClient, basePaths, localization, toast, viewPaths, navigate } =
    useAuth(config)

  const forgotPassword = async (_: object, formData: FormData) => {
    const email = formData.get("email") as string

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${basePaths.auth}/${viewPaths.auth.resetPassword}`
    })

    if (error) {
      toast.error(error.message || error.statusText)
    } else {
      toast.success(localization.auth.passwordResetEmailSent)
      navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)
    }

    return { email }
  }

  return useActionState(forgotPassword, {
    email: ""
  })
}
