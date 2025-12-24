import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "../auth/use-auth"

/**
 * Provides an action state hook that initiates an email change request for the current user.
 *
 * @param config - Optional auth configuration forwarded to the auth hook
 * @returns An action state (initialized with `email` = "") whose action initiates the email change process and displays success or error toasts
 */
export function useChangeEmail(config?: AnyAuthConfig) {
  const { authClient, baseURL, localization, toast, viewPaths } =
    useAuth(config)

  const changeEmail = async (_: object, formData: FormData) => {
    const email = formData.get("email") as string

    const { error } = await authClient.changeEmail({
      newEmail: email,
      callbackURL: `${baseURL}/${viewPaths.settings.account}`
    })

    if (error) {
      toast.error(error.message || error.statusText)
    } else {
      toast.success(localization.settings.changeEmailSuccess)
    }

    return { email }
  }

  return useActionState(changeEmail, { email: "" })
}
